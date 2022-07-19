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
import { AdminEntity } from 'src/db/entities';
import { adminRepository } from '../../../db/repositories';
import { LoginDto } from './dto/login.dto';
import { AdminStatus, JwtSecretKey } from 'src/common/enums';
import { redisClient } from 'src/common/providers/redis';
import { AuthServiceRepository } from './auth.repository';
import { Utils } from 'src/common/utils';
import { AuthResponse } from 'src/common/types/admin.type';
import { Jwt } from 'src/common/providers/jwt';
import { JwtSignOptions } from 'src/common/types/other.type';

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
            const match = await bcrypt.compare(
                password + admin.salt,
                admin.password,
            );
            equal(match, true);
        } catch {
            /**
             * Check whether an admin needs to be blocked if the count
             * of failed login attempts achieved the maximum value
             */
            if (admin.status == AdminStatus.ACTIVE) {
                const key = `admin:${username}:login-attempts`;
                const attemptsCount = await redisClient.get(key);

                if (
                    +configService.get('ADMIN_MAX_LOGIN_ATTEMPTS') <=
                    +attemptsCount
                ) {
                    await Promise.all([
                        this.repository.updateAdmin(admin.id, {
                            status: AdminStatus.BLOCKED,
                        }),
                        redisClient.del(key),
                    ]);
                } else {
                    await redisClient.incr(key);
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
        const jwtOptions: JwtSignOptions = {
            data: {
                adminId: admin.id,
                code: serverCode,
            },
            expiresIn: expireAt.getTime(),
            secretKey: JwtSecretKey.ADMIN,
        };
        return {
            jwt: {
                token: await Jwt.sign(jwtOptions),
                expireAt,
            },
            client: {
                code: clientCode,
            },
        };
    }
}
