import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as i18next from 'i18next';
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { strictEqual as equal } from 'assert';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { AuthServiceRepository } from './auth.repository';
import {
    userCodeRepository,
    userInfoRepository,
    userRepository,
    userTokenRepository,
} from '../../../db/repositories';
import { Utils } from '../../../common/utils';
import { appDataSource } from '../../../db/dataSource';
import {
    UserCodeData,
    FullUserInfo,
    UserActivityData,
} from '../../../common/types/user.type';
import { JwtCompleteData, PlainRecord } from '../../../common/types/other.type';
import {
    LoggerTemplate,
    MailerTemplate,
    UserAction,
    UserStatus,
    UserTokenType,
    Currency,
} from '../../../common/enums';
import {
    UserCodeEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
} from '../../../db/entities';
import { UserActivityLogger } from '../../../common/providers/loggers/userActivity';
import { ApiAuthStrategy } from 'src/common/providers/jwt/strategies/api.auth-strategy';
import { CacheTemplate } from 'src/common/providers/cache/cache.template';
import { Jwt } from 'src/common/providers/jwt/index';
import { Mailer } from '../../../common/providers/mailer/index';
import { WalletSharedService } from '../wallet/wallet.shared';
import { AuthUtility } from './auth.utility';
import {
    LoginDto,
    RestorePasswordCompleteDto,
    RestorePasswordConfirmCodeDto,
    RestorePasswordInitiateDto,
    SignUpDto,
} from './dto';
import { LoginPayloadDto } from './dto/payload/login-payload.dto';
import { UserPayloadDto } from '../user/dto/payload/user-payload.dto';
import { RestorePasswordCompleteCodeDto } from './dto/payload/restore-password-complete-code.dto';
import { CacheProvider } from 'src/common/providers/cache/cache.provider';

@Injectable()
export class AuthService {
    constructor(
        private readonly repository: AuthServiceRepository,
        private readonly utility: AuthUtility,
        private readonly configService: ConfigService,
        private readonly walletSharedService: WalletSharedService,
        private readonly cacheProvider: CacheProvider,
    ) {}

    /**
     * Register a new user by creating appropriate
     * records in the DB
     */
    async signUp(dto: SignUpDto): Promise<UserPayloadDto> {
        const memberId = await this.utility.generateUserMemberId();

        const userData: FullUserInfo = {
            memberId,
            email: dto.email,
            password: dto.password,
            status: UserStatus.EMAIL_NOT_CONFIRMED,
        };
        const confirmCode = {
            code: Utils.generateRandomString({
                length: +this.configService.getOrThrow(
                    'miscellaneous.email-confirm-code-length',
                ),
            }),
            expireAt: moment()
                .add(
                    +this.configService.getOrThrow(
                        'restrictions.confirm-email-expiration',
                    ),
                    'minute',
                )
                .toDate(),
            action: UserAction.CONFIRM_EMAIL,
        };
        let user: UserEntity;
        let userInfo: UserInfoEntity;

        /**
         * Save primary user info within a transaction
         */
        await appDataSource.manager.transaction(
            async (transactionalEntityManager: EntityManager) => {
                user = await this.repository.createUser(
                    userData,
                    transactionalEntityManager,
                );
                const city = await this.repository.createCity(
                    dto.city,
                    transactionalEntityManager,
                );
                const userCodeData: UserCodeData = {
                    ...confirmCode,
                    ...{ user },
                };
                const userInfoData = {
                    ...dto,
                    user,
                    city,
                };
                userInfo = userInfoRepository.create(userInfoData);

                await Promise.all([
                    this.repository.createUserInfo(
                        userInfoData,
                        transactionalEntityManager,
                    ),
                    this.repository.createUserCode(
                        userCodeData,
                        transactionalEntityManager,
                    ),
                ]);
                /**
                 * Create initial user's wallets
                 */
                await Promise.all(
                    [Currency.US_DOLLAR, Currency.EURO, Currency.GOLD].map(
                        (currencyId) =>
                            this.walletSharedService.createWallet(
                                currencyId,
                                user,
                                transactionalEntityManager,
                            ),
                    ),
                );
            },
        );
        const payload = new UserPayloadDto(user);
        payload.addUserInfo(userInfo);

        /**
         * Log the action of a user
         */
        const logData: UserActivityData = {
            user,
            action: UserAction.CREATE,
            template: LoggerTemplate.SIGNUP,
            metadata: memberId.toString(),
        };
        await UserActivityLogger.write(logData);
        Mailer.sendMail({
            to: dto.email,
            subject: i18next.t('mailer.signup-subject'),
            template: MailerTemplate.SIGNUP,
            data: confirmCode,
        });
        return payload;
    }

    /**
     * Login a user using the given 'memberId' and password
     * then return pair of the tokens
     */
    async login(
        { memberId, password }: LoginDto,
        ip: string,
    ): Promise<LoginPayloadDto[]> {
        const user = await this.repository.findUserByParams({ memberId }, [
            'user.id',
            'user.password',
            'user.salt',
            'user.status',
        ]);
        try {
            equal(user instanceof UserEntity, true);
            const isPasswordValid = await bcrypt.compare(
                password + user.salt,
                user.password,
            );
            if (!isPasswordValid) {
                const seconds = +this.configService.getOrThrow(
                    'restrictions.max-login-attempts-expiration',
                );
                await this.cacheProvider
                    .buildManager({
                        template: CacheTemplate.API_LOGIN_ATTEMPTS,
                        identifier: memberId.toString(),
                    })
                    .save({
                        increase: true,
                        expiration: seconds,
                    });
                equal(1, 0);
            }
        } catch {
            throw new ForbiddenException(i18next.t('wrong-credentials'));
        }
        if (user.status == UserStatus.EMAIL_NOT_CONFIRMED) {
            throw new ForbiddenException(i18next.t('email-not-confirmed'));
        }
        if (user.status == UserStatus.BLOCKED) {
            throw new ForbiddenException(i18next.t('account-is-blocked'));
        }
        const tokens = await this.utility.generateJwtTokens(user);
        /**
         * Log the executed action
         */
        const logData: UserActivityData = {
            user,
            action: UserAction.LOGIN,
            template: LoggerTemplate.SIGNIN,
            metadata: ip,
        };
        await UserActivityLogger.write(logData);
        return tokens;
    }

    /**
     * Validate the given 'refresh-token' and then
     * generate the new pairs of tokens
     */
    async updateToken(encryptedToken: string): Promise<JwtCompleteData[]> {
        let refreshToken: UserTokenEntity;
        const jwtInstance = new Jwt(new ApiAuthStrategy(UserTokenType.REFRESH));
        try {
            const decryptedData = await jwtInstance.verify(encryptedToken);
            const authStrategy = jwtInstance.getStrategy();

            authStrategy.validateDecryptedData(decryptedData);

            refreshToken = await authStrategy.getTokenInstance(decryptedData);
            authStrategy.checkAdmission(refreshToken);
        } catch {
            throw new BadRequestException(i18next.t('broken-refresh-token'));
        }
        const tasks: Promise<void>[] = [
            this.repository.deletePairOfTokens(refreshToken.id),
        ];
        const accessToken = await this.repository.findAccessToken(
            refreshToken.id,
        );
        /**
         * Remove the related record of the Access token from the Cache
         */
        if (accessToken instanceof UserTokenEntity) {
            const identifier = `${accessToken.code}${accessToken.userId}`;
            tasks.push(
                this.cacheProvider
                    .buildManager({
                        template: CacheTemplate.API_ACCESS_TOKEN,
                        identifier,
                    })
                    .remove(),
            );
        }
        await Promise.all(tasks);
        return this.utility.generateJwtTokens(refreshToken.user);
    }

    /**
     * Disconnect the user from the server and prevent
     * further interaction within the given access token
     */
    async logout(
        authorizationHeader: string,
        allDevices: boolean,
    ): Promise<void> {
        const jwtInstance = new Jwt(new ApiAuthStrategy(UserTokenType.ACCESS));

        let accessToken: UserTokenEntity;
        let decryptedData: PlainRecord;
        try {
            const [, encryptedToken] = authorizationHeader.split(' ');
            decryptedData = await jwtInstance.verify(encryptedToken);
            const authStrategy = jwtInstance.getStrategy();

            authStrategy.validateDecryptedData(decryptedData);

            accessToken = await authStrategy.getTokenInstance(decryptedData);
            authStrategy.checkAdmission(accessToken);
        } catch {
            throw new BadRequestException(i18next.t('broken-access-token'));
        }
        /**
         * Remove all records (from DB and the Cache)
         * that are related to JWT mechanism
         */
        if (allDevices) {
            const userId = +decryptedData.userId;
            const userTokens = await userTokenRepository.findBy({
                userId,
                type: UserTokenType.ACCESS,
            });
            const tasks: Promise<void>[] = [
                this.repository.deleteAllTokens(userId),
            ];
            for (const { code, userId } of userTokens) {
                tasks.push(
                    this.cacheProvider
                        .buildManager({
                            template: CacheTemplate.API_ACCESS_TOKEN,
                            identifier: `${code}${userId}`,
                        })
                        .remove(),
                );
            }
            await Promise.all(tasks);
        } else {
            /**
             * Remove only 2 records from DB and 1 from the Cache
             * that are related to a current session
             */
            const { userId, code } = decryptedData;
            const identifier = `${code}${userId}`;

            const userToken = await userTokenRepository.findOneBy({
                userId: +userId,
                code: code.toString(),
                type: UserTokenType.ACCESS,
            });
            await Promise.all([
                this.cacheProvider
                    .buildManager({
                        template: CacheTemplate.API_ACCESS_TOKEN,
                        identifier,
                    })
                    .remove(),
                this.repository.deletePairOfTokens(userToken.relatedTokenId),
            ]);
        }
        await UserActivityLogger.write({
            user: accessToken.user,
            action: UserAction.LOGOUT,
            template: LoggerTemplate.PLAIN,
        });
    }

    /**
     * Confirm an email by passing the confirmation code
     */
    async confirmEmail(code: string): Promise<void> {
        const userCode = await this.repository.findUserCode(
            code,
            UserAction.CONFIRM_EMAIL,
        );
        if (userCode.expireAt <= new Date()) {
            throw new BadRequestException(i18next.t('confirm-code-expired'));
        }
        const { user } = userCode;
        user.status = UserStatus.EMAIL_CONFIRMED;
        await Promise.all([
            userRepository.save(user),
            userCodeRepository.remove(userCode),
        ]);
    }

    /**
     * Initiate the process of restoring a user password by
     * validating the given 'memberId' and 'email'
     * and then creating a confirmation code
     */
    async restorePasswordInitiate({
        email,
        memberId,
    }: RestorePasswordInitiateDto): Promise<void> {
        const { configService } = this;
        const user = await this.repository.findUserByParams(
            { email, memberId },
            ['user.id'],
        );
        if (!(user instanceof UserEntity)) {
            return;
        }
        const attemptsRestriction = +configService.get(
            'MAX_RESET_PASSWORD_ATTEMPTS_EXPIRATION',
        );
        const recordsCount = await this.repository.countUserCodesBy({
            user,
            attemptsRestriction: moment()
                .subtract(attemptsRestriction, 'minute')
                .toDate(),
        });
        if (recordsCount >= +configService.get('MAX_RESET_PASSWORD_ATTEMPTS')) {
            throw new ForbiddenException(
                i18next.t('exceeded-attempts-to-restore-password'),
            );
        }
        /**
         * Generate and save the code to proceed the process
         * of resetting a password
         */
        const code = Utils.generateRandomString({
            onlyDigits: true,
            length: +configService.get('RESTORE_PASSWORD_CODE_LENGTH'),
        });
        const lifetime = +configService.get(
            'RESTORE_PASSWORD_INITIATE_CODE_EXPIRATION',
        );
        const expireAt = moment().add(lifetime, 'minute').toDate();
        const userCodeData: UserCodeData = {
            user,
            code,
            action: UserAction.RESTORE_PASSWORD_INITIATE,
            expireAt,
        };
        await this.repository.createUserCode(userCodeData);
        /**
         * Send an email
         */
        Mailer.sendMail({
            to: email,
            subject: i18next.t('mailer.reset-password'),
            template: MailerTemplate.RESTORE_PASSWORD,
            data: { code },
        });
    }

    /**
     * The next step is to validate the confirmation code
     * and allow a user to follow the last step.
     * The being returned code is used in the last
     * step of the procedure
     */
    async restorePasswordConfirmCode({
        confirmCode,
    }: RestorePasswordConfirmCodeDto): Promise<RestorePasswordCompleteCodeDto> {
        const userCode = await this.getAndValidateUserCode(
            confirmCode,
            UserAction.RESTORE_PASSWORD_INITIATE,
        );
        const completeCode = Utils.generateRandomString({
            length: 8,
            onlyDigits: true,
        });
        const lifetime = +this.configService.getOrThrow(
            'restrictions.restore-password-complete-code-expiration',
        );
        const expireAt = moment().add(lifetime, 'minute').toDate();

        const userCodeData: UserCodeData = {
            user: userCode.user,
            code: completeCode,
            action: UserAction.RESTORE_PASSWORD_COMPLETE,
            expireAt,
        };
        await Promise.all([
            this.repository.createUserCode(userCodeData),
            userCodeRepository.remove(userCode),
        ]);
        return { completeCode };
    }

    /**
     * Update the user's password by passing the new one
     * as well as a special validation code.
     */
    async restorePasswordComplete({
        completeCode,
        password,
    }: RestorePasswordCompleteDto): Promise<void> {
        const userCode = await this.getAndValidateUserCode(
            completeCode,
            UserAction.RESTORE_PASSWORD_COMPLETE,
        );
        const { user } = userCode;

        user.password = password;
        const logData: UserActivityData = {
            user,
            action: UserAction.CHANGE,
            template: LoggerTemplate.PASSWORD_CHANGED,
        };
        await Promise.all([
            userRepository.save(user),
            userCodeRepository.remove(userCode),
            UserActivityLogger.write(logData),
        ]);
    }

    /**
     * Find 'userCode' record and validate it
     */
    private async getAndValidateUserCode(
        code: string,
        action: UserAction,
    ): Promise<UserCodeEntity> {
        const userCode = await this.repository.findUserCode(code, action);
        try {
            equal(userCode instanceof UserCodeEntity, true);
            equal(userCode.expireAt > new Date(), true);
        } catch {
            throw new BadRequestException(
                i18next.t('wrong-restore-password-code'),
            );
        }
        return userCode;
    }
}
