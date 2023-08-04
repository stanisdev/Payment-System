import * as bcrypt from 'bcrypt';
import * as i18next from 'i18next';
import * as moment from 'moment';
import { strictEqual as equal } from 'assert';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminEntity } from '../../../db/entities';
import { adminRepository } from '../../../db/repositories';
import { LoginDto } from './dto/login.dto';
import { AdminStatus } from 'src/common/enums';
import { CacheProvider } from '../../../common/providers/cache/index';
import { CacheTemplate } from '../../../common/providers/cache/templates';
import { AuthServiceRepository } from './auth.repository';
import { Utils } from 'src/common/utils';
import { AuthResponse } from 'src/common/types/admin.type';
import { Jwt } from 'src/common/providers/jwt/index';
import { AdminAuthStrategy } from 'src/common/providers/jwt/strategies/admin.auth-strategy';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly repository: AuthServiceRepository,
    ) {}

    /**
     * Sign in an admin by using the given username and password
     */
    async login({ username, password }: LoginDto): Promise<AuthResponse> {
        const { configService } = this;
        const admin = await adminRepository.findOneBy({
            username,
        });
        try {
            equal(admin instanceof AdminEntity, true);
            const isPasswordValid = await bcrypt.compare(
                password + admin.salt,
                admin.password,
            );
            equal(isPasswordValid, true);
        } catch {
            /**
             * Check whether an admin needs to be blocked if the count
             * of failed login attempts achieved the maximum value
             */
            if (admin.status == AdminStatus.ACTIVE) {
                const cache = CacheProvider.build({
                    template: CacheTemplate.ADMIN_LOGIN_ATTEMPTS,
                    identifier: username,
                });
                const data = await cache.find();
                const attemptsCount = Number.parseInt(data);

                if (
                    Number.isInteger(attemptsCount) &&
                    attemptsCount >=
                        +configService.get('ADMIN_MAX_LOGIN_ATTEMPTS')
                ) {
                    await Promise.all([
                        this.repository.updateAdmin(admin.id, {
                            status: AdminStatus.BLOCKED,
                        }),
                        await cache.remove(),
                    ]);
                } else {
                    await cache.save({
                        increase: true,
                    });
                }
            }
            throw new BadRequestException(i18next.t('admin.wrong-credentials'));
        }
        if (admin.status === AdminStatus.BLOCKED) {
            throw new ForbiddenException(
                i18next.t('admin.your-account-is-blocked'),
            );
        }
        /**
         * Generate essential codes and save them
         */
        const [serverCode, clientCode] = await Promise.all([
            Utils.generateRandomString({
                length: +configService.get('ADMIN_AUTH_SERVER_CODE_LENGTH'),
            }),
            Utils.generateRandomString({
                length: +configService.get('ADMIN_AUTH_CLIENT_CODE_LENGTH'),
            }),
        ]);
        const expireAt = moment()
            .add(configService.get('ADMIN_JWT_EXPIRATION'), 'minute')
            .toDate();
        await this.repository.createToken({
            admin,
            serverCode,
            clientCode,
            expireAt,
        });
        /**
         * Obtain JWT
         */
        const jwtInstance = new Jwt(new AdminAuthStrategy());
        const jwtSignParams = {
            data: {
                adminId: admin.id,
                code: serverCode,
            },
            expiresIn: expireAt.getTime(),
        };
        return {
            jwt: {
                token: await jwtInstance.sign(jwtSignParams),
                expireAt,
            },
            client: {
                code: clientCode,
            },
        };
    }
}
