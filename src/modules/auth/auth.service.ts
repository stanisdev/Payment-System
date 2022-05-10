import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { capitalize } from 'lodash';
import { EntityManager } from 'typeorm';
import { AuthServiceRepository } from './auth.repository';
import { userRepository, userLogRepository } from '../../db/repositories';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { Utils } from '../../common/utils';
import { appDataSource } from '../../db/dataSource';
import { JwtExpiration, SignInResponse, EmptyObject } from '../../common/types';
import { Jwt } from '../../common/jwt';
import { redisClient } from 'src/common/redis';
import { UserAction } from 'src/common/enums';
import { UserEntity } from 'src/db/entities';

@Injectable()
export class AuthService {
    private jwt: JwtExpiration;

    /**
     * The constructor of the class
     */
    constructor(
        private readonly repository: AuthServiceRepository,
        private readonly configService: ConfigService,
    ) {
        const [accessDuration, accessUnit] = this.configService
            .get('JWT_ACCESS_LIFETIME')
            .split(' ');
        const [refreshDuration, refreshUnit] = this.configService
            .get('JWT_REFRESH_LIFETIME')
            .split(' ');
        this.jwt = {
            access: {
                unit: accessUnit,
                duration: +accessDuration,
            },
            refresh: {
                unit: refreshUnit,
                duration: +refreshDuration,
            },
        };
    }

    /**
     * Register a new user by creating appropriate
     * records in the DB
     */
    async signUp(signUpDto: SignUpDto): Promise<EmptyObject> {
        const memberId = await this.generateMemberId();

        const userData = {
            memberId,
            email: signUpDto.email,
            password: signUpDto.password,
            status: 1,
        };
        let user: UserEntity;
        await appDataSource.manager.transaction(
            async (transactionalEntityManager: EntityManager) => {
                user = await this.repository.createUser(
                    transactionalEntityManager,
                    userData,
                );
                const city = await this.repository.createCity(
                    transactionalEntityManager,
                    signUpDto.city,
                );
                const userInfoData = {
                    ...signUpDto,
                    user,
                    city,
                };
                await this.repository.createUserInfo(
                    transactionalEntityManager,
                    userInfoData,
                );
            },
        );
        const logData = {
            user,
            action: UserAction.CREATE,
            details: 'Member ID: ' + memberId,
        };
        await userLogRepository.createOne(logData);
        return {};
    }

    /**
     * Generate and get a unique "memberId" of
     * the being created user
     */
    private async generateMemberId(): Promise<number> {
        let memberId: number;
        for (let a = 0; a < 100; a++) {
            memberId = +(await Utils.generateRandomString({
                onlyDigits: true,
                length: 7,
            }));
            const user = await userRepository.findOneBy({
                memberId,
            });
            if (!(user instanceof Object)) {
                return memberId;
            }
        }
        // @todo: use i18next
        throw new InternalServerErrorException('User cannot be created');
    }

    /**
     * Login a user using the given 'memberId' and password
     * then return pair of the tokens
     */
    async login(
        { memberId, password }: LoginDto,
        ip: string,
    ): Promise<SignInResponse[]> {
        const user = await userRepository.findOneBy({ memberId });
        try {
            if (!(user instanceof Object)) {
                throw new Error();
            }
            const match = await bcrypt.compare(
                password + user.salt,
                user.password,
            );
            if (!match) {
                const seconds = +this.configService.get(
                    'MAX_ATTEMPTS_TO_LOGIN_EXPIRATION',
                );
                const key = `memberId:${memberId}`;
                await redisClient.incr(key);
                await redisClient.expire(key, seconds);
                throw new Error();
            }
        } catch {
            throw new ForbiddenException('Wrong credentials');
        }
        /**
         * Get tokens and write the appropriate log
         */
        const tasks = ['access', 'refresh'].map((tokenType) =>
            this.generateJwtToken(tokenType, user),
        );
        const tokens = await Promise.all(tasks);
        const logData = {
            user,
            action: UserAction.LOGIN,
            details: 'Login IP : ' + ip,
        };
        await userLogRepository.createOne(logData);
        return tokens;
    }

    /**
     * Generate pairs of jwt-tokens and save the related data
     */
    private async generateJwtToken(type: string, user: UserEntity) {
        const code = await Utils.generateRandomString({ length: 20 });
        const { unit, duration } = this.jwt[type];
        const expireAt = moment().add(unit, duration).toDate();
        const tokenData = {
            user,
            code,
            expireAt,
            type: capitalize(type),
        };
        await this.repository.createUserToken(tokenData);
        const jwtOptions = {
            data: {
                userId: user.id,
                code,
            },
            expiresIn: expireAt.getTime(),
        };
        return {
            type,
            token: await Jwt.sign(jwtOptions),
            expireAt,
        };
    }
}
