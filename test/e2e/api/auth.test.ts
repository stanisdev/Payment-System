import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import {
    HttpServer,
    HttpStatus,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../../../src/modules/app.module';
import { appDataSource } from '../../../src/db/dataSource';
import { redisClient } from '../../../src/common/providers/redis';
import { Mailer } from '../../../src/common/providers/mailer';
import {
    userCodeRepository,
    userRepository,
    userTokenRepository,
} from '../../../src/db/repositories';
import { UserCodeEntity, UserEntity } from '../../../src/db/entities';
import {
    UserStatus,
    UserAction,
    UserTokenType,
} from '../../../src/common/enums';
import { AuthSeeder } from '../../seeders/auth';
import { Utils } from '../../utils';
const { env } = process;

const prefix = '/api';

describe('Auth controller', () => {
    let app: INestApplication;
    let server: HttpServer;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await appDataSource.initialize();
        await app.init();

        server = app.getHttpServer();
        Mailer.setTransporter();
    });

    describe('POST: /auth/sign-up', () => {
        test('It should register a new user', async () => {
            const data = AuthSeeder['sign-up.user'];

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.body).toStrictEqual({});
            expect(response.statusCode).toBe(HttpStatus.CREATED);

            const user = await userRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.info', 'info')
                .leftJoinAndSelect('user.codes', 'code')
                .where('user.email = :email', { email: data.email })
                .getOne();

            expect(user).toBeInstanceOf(UserEntity);
            expect(user.email).toBe(data.email);
            expect(typeof user.memberId).toBe('number');
            expect(user.info.accountName).toBe(data.accountName);
            expect(user.info.fullName).toBe(data.fullName);
            expect(user.info.country).toBe(data.country);
            expect(user.info.address).toBe(data.address);
            expect(+user.info.zipCode).toBe(+data.zipCode);
            expect(user.info.phone).toBe(data.phone);
            expect(user.info.accountType).toBe(data.accountType);
            expect(user.status).toBe(UserStatus.EMAIL_NOT_CONFIRMED);

            const isPasswordValid = await bcrypt.compare(
                data.password + user.salt,
                user.password,
            );
            expect(isPasswordValid).toBe(true);

            const [userCode] = user.codes;
            const codeLifetime = moment()
                .add(+env.CONFIRM_EMAIL_EXPIRATION, 'minute')
                .toDate();
            expect(userCode.action).toBe(UserAction.CONFIRM_EMAIL);
            expect(typeof userCode.code).toBe('string');
            expect(userCode.code.length).toBe(+env.EMAIL_CONFIRM_CODE_LENGTH);
            expect(userCode.expireAt <= codeLifetime).toBe(true);
        });

        test('It should restrict registering a new user since the given email already exists', async () => {
            const data = AuthSeeder['basic.user'];
            await userRepository
                .createQueryBuilder()
                .insert()
                .values(data)
                .execute();
            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since the passed "accountType" parameter is incorrect', async () => {
            const data = AuthSeeder['sign-up.user'];
            data.accountType = 'unknownType';

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since the passed email is incorrect', async () => {
            const data = AuthSeeder['sign-up.user'];
            data.email = 'what?';

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a password has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.password;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a full name has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.fullName;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a city has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.city;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a country has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.country;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a zip code has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.zipCode;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a phone has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.phone;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since an email has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.email;

            const response = await request(server)
                .post(prefix + '/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('POST: /auth/login', () => {
        test('It should validate a user successfully and return pair of the tokens', async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData();
            const { body, statusCode } = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: memberId,
                    password,
                });
            expect(statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBe(2);

            const accessToken = body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );
            const refreshToken = body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            accessToken.expireAt = new Date(accessToken.expireAt);
            refreshToken.expireAt = new Date(refreshToken.expireAt);

            expect(typeof accessToken.token).toBe('string');
            expect(typeof refreshToken.token).toBe('string');
            expect(lodash.isDate(accessToken.expireAt)).toBe(true);
            expect(lodash.isDate(refreshToken.expireAt)).toBe(true);

            const accessTokenLifetime = moment()
                .add(+env.JWT_ACCESS_LIFETIME, 'hours')
                .toDate();
            const refreshTokenLifetime = moment()
                .add(+env.JWT_REFRESH_LIFETIME, 'hours')
                .toDate();
            expect(accessToken.expireAt <= accessTokenLifetime).toBe(true);
            expect(refreshToken.expireAt <= refreshTokenLifetime).toBe(true);
        });

        test('It should login and get valid access token', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            expect(loginResponse.statusCode).toBe(HttpStatus.OK);
            const accessToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );

            const userMeResponse = await request(server)
                .get(prefix + '/user/me')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(userMeResponse.statusCode).toBe(HttpStatus.OK);
            expect(userMeResponse.body.email).toBe(data.email);
            expect(userMeResponse.body.memberId).toBe(data.memberId);

            const user = await userRepository.findOneBy({
                email: userMeResponse.body.email,
                memberId: userMeResponse.body.memberId,
            });
            expect(user.id).toBe(userMeResponse.body.id);
        });

        test('It should login and get valid refresh token', async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData();
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId,
                    password,
                });
            expect(loginResponse.statusCode).toBe(HttpStatus.OK);
            const refreshToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );

            const updateTokenResponse = await request(server)
                .post(prefix + '/auth/update-token')
                .send({
                    refreshToken: refreshToken.token,
                });
            expect(updateTokenResponse.statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(updateTokenResponse.body)).toBe(true);
            expect(updateTokenResponse.body.length).toBe(2);
        });

        test('It should throw an error if passed a wrong "memberId"', async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData();
            const response = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: +`${memberId}9`,
                    password,
                });
            expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
            expect(Array.isArray(response.body)).toBe(false);
            expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
        });

        test('It should throw an error if passed a wrong password', async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData();
            const response = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId,
                    password: password + '?',
                });
            expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
            expect(Array.isArray(response.body)).toBe(false);
            expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
        });

        test(`It should throw an error if the user's email is not confirmed`, async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData(
                UserStatus.EMAIL_NOT_CONFIRMED,
            );
            const response = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId,
                    password,
                });
            expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
            expect(Array.isArray(response.body)).toBe(false);
            expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
        });

        test(`It should throw an error if the user's acount is blocked`, async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData(UserStatus.BLOCKED);
            const response = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId,
                    password,
                });
            expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
            expect(Array.isArray(response.body)).toBe(false);
            expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
        });

        test(`It should throw an error if the user attempted too many times to log in`, async () => {
            const {
                data: { memberId },
                password,
            } = await Utils.createUserAndGetData();

            for (let a = 0; a < +env.MAX_LOGIN_ATTEMPTS; a++) {
                const response = await request(server)
                    .post(prefix + '/auth/login')
                    .send({
                        memberId,
                        password: password + '?',
                    });
                expect(response.statusCode).toBe(HttpStatus.FORBIDDEN);
                expect(Array.isArray(response.body)).toBe(false);
                expect(response.body.statusCode).toBe(HttpStatus.FORBIDDEN);
            }
            const response = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId,
                    password: password + '?',
                });
            expect(response.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
            expect(Array.isArray(response.body)).toBe(false);
            expect(response.body.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
        });
    });

    describe('POST: /auth/logout', () => {
        test('It should logout successfully from one device', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const accessToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );

            const logoutResponse = await request(server)
                .get(prefix + '/auth/logout')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(logoutResponse.statusCode).toBe(HttpStatus.OK);
            expect(Object.keys(logoutResponse.body).length).toBe(0);

            const user = await userRepository.findOneBy({
                email: data.email,
            });
            const userTokensCount = await userTokenRepository
                .createQueryBuilder('userToken')
                .select('COUNT(userToken.id)', 'cnt')
                .where('"userToken"."userId" = :userId', { userId: user.id })
                .getRawOne();
            expect(userTokensCount.cnt).toBe('2');
        });

        test('It should logout successfully from all devices', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const accessToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );

            const logoutResponse = await request(server)
                .get(prefix + '/auth/logout?allDevices=true')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(logoutResponse.statusCode).toBe(HttpStatus.OK);
            expect(Object.keys(logoutResponse.body).length).toBe(0);

            const user = await userRepository.findOneBy({
                email: data.email,
            });
            const userTokensCount = await userTokenRepository
                .createQueryBuilder('userToken')
                .select('COUNT(userToken.id)', 'cnt')
                .where('"userToken"."userId" = :userId', { userId: user.id })
                .getRawOne();
            expect(userTokensCount.cnt).toBe('0');
        });

        test('It should prevent double attempts to logout and throw an error', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const accessToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );

            await request(server)
                .get(prefix + '/auth/logout')
                .set('Authorization', `Bearer ${accessToken.token}`);
            const logoutResponse = await request(server)
                .get(prefix + '/auth/logout')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(logoutResponse.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should throw an error if the given access token is incorrect', async () => {
            const response = await request(server)
                .get(prefix + '/auth/logout')
                .set('Authorization', `Bearer JJJJJJJJJJJJJJJ`);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    describe('POST: /auth/update-token', () => {
        test('It should successfully update tokens by removing old ones and generating new ones', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            let refreshToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            const { body, statusCode } = await request(server)
                .post(prefix + '/auth/update-token')
                .send({ refreshToken: refreshToken.token });

            expect(statusCode).toBe(HttpStatus.OK);
            expect(Array.isArray(body)).toBe(true);
            expect(body.length).toBe(2);

            const accessToken = body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );
            refreshToken = body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            accessToken.expireAt = new Date(accessToken.expireAt);
            refreshToken.expireAt = new Date(refreshToken.expireAt);

            expect(typeof accessToken.token).toBe('string');
            expect(typeof refreshToken.token).toBe('string');
            expect(lodash.isDate(accessToken.expireAt)).toBe(true);
            expect(lodash.isDate(refreshToken.expireAt)).toBe(true);

            const accessTokenLifetime = moment()
                .add(+env.JWT_ACCESS_LIFETIME, 'hours')
                .toDate();
            const refreshTokenLifetime = moment()
                .add(+env.JWT_REFRESH_LIFETIME, 'hours')
                .toDate();
            expect(accessToken.expireAt <= accessTokenLifetime).toBe(true);
            expect(refreshToken.expireAt <= refreshTokenLifetime).toBe(true);

            const user = await userRepository.findOneBy({
                email: data.email,
            });
            const userTokensCount = await userTokenRepository
                .createQueryBuilder('userToken')
                .select('COUNT(userToken.id)', 'cnt')
                .where('"userToken"."userId" = :userId', { userId: user.id })
                .getRawOne();
            expect(userTokensCount.cnt).toBe('2');
        });

        test('It should get a valid access token that can be used for requests to the API', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const loginResponse = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const refreshToken = loginResponse.body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            const { body } = await request(server)
                .post(prefix + '/auth/update-token')
                .send({ refreshToken: refreshToken.token });
            const accessToken = body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );
            const userMeResponse = await request(server)
                .get(prefix + '/user/me')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(userMeResponse.statusCode).toBe(HttpStatus.OK);
            expect(userMeResponse.body.email).toBe(data.email);
            expect(userMeResponse.body.memberId).toBe(data.memberId);

            const user = await userRepository.findOneBy({
                email: userMeResponse.body.email,
                memberId: userMeResponse.body.memberId,
            });
            expect(user.id).toBe(userMeResponse.body.id);
        });

        test('It should remove old pairs of tokens that become invalid', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const { body } = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const refreshToken = body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            const accessToken = body.find(
                (token) => token.type == UserTokenType.ACCESS,
            );
            await request(server)
                .post(prefix + '/auth/update-token')
                .send({ refreshToken: refreshToken.token });

            const userMeResponse = await request(server)
                .get(prefix + '/user/me')
                .set('Authorization', `Bearer ${accessToken.token}`);
            expect(userMeResponse.statusCode).toBe(HttpStatus.FORBIDDEN);
        });

        test('It should throw an error if the passed refresh token is broken', async () => {
            const { statusCode, body } = await request(server)
                .post(prefix + '/auth/update-token')
                .send({ refreshToken: AuthSeeder['broken-jwt-token'] });
            expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(Array.isArray(body)).toBe(false);
        });

        test('It should throw an error if the passed refresh token expired', async () => {
            const { data, password } = await Utils.createUserAndGetData();
            const { body } = await request(server)
                .post(prefix + '/auth/login')
                .send({
                    memberId: data.memberId,
                    password,
                });
            const refreshToken = body.find(
                (token) => token.type == UserTokenType.REFRESH,
            );
            const user = await userRepository.findOneBy({
                email: data.email,
            });
            const refreshTokenRecord = await userTokenRepository
                .createQueryBuilder('userToken')
                .select()
                .where('"userToken".type = :type', {
                    type: UserTokenType.REFRESH,
                })
                .andWhere('"userToken"."userId" = :userId', { userId: user.id })
                .getOne();

            refreshTokenRecord.expireAt = moment()
                .subtract(1, 'hours')
                .toDate();
            await userTokenRepository.save(refreshTokenRecord);
            const updateTokenResponse = await request(server)
                .post(prefix + '/auth/update-token')
                .send({ refreshToken: refreshToken.token });
            expect(updateTokenResponse.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(Array.isArray(updateTokenResponse.body)).toBe(false);
        });
    });

    describe('POST: /auth/confirm-email/:code', () => {
        test('It should confirm the email address by passing the valide confirmation code', async () => {
            const userData = await Utils.createUserAndGetData(
                UserStatus.EMAIL_NOT_CONFIRMED,
            );

            const expireAt = moment()
                .add(+env.CONFIRM_EMAIL_EXPIRATION, 'minutes')
                .toDate();
            const code = faker.internet.password(7);
            const userCodeData = {
                userId: userData.id,
                code,
                action: UserAction.CONFIRM_EMAIL,
                expireAt,
            };
            const { id: userCodeId } = await Utils.createUserCode(userCodeData);

            const response = await request(server).get(
                prefix + `/auth/confirm-email/${code}`,
            );

            expect(response.statusCode).toBe(HttpStatus.OK);

            const userCodeRecord = await userCodeRepository.findOneBy({
                id: userCodeId,
            });
            const userRecord = await userRepository.findOneBy({
                id: userData.id,
            });
            expect(userRecord.status).toBe(UserStatus.EMAIL_CONFIRMED);
            expect(userCodeRecord).toBe(null);
        });

        test('It restricts confirming the email address since the confirmation code is expired', async () => {
            const userData = await Utils.createUserAndGetData(
                UserStatus.EMAIL_NOT_CONFIRMED,
            );

            const expireAt = moment()
                .subtract(+env.CONFIRM_EMAIL_EXPIRATION, 'minutes')
                .toDate();
            const code = faker.internet.password(7);
            const userCodeData = {
                userId: userData.id,
                code,
                action: UserAction.CONFIRM_EMAIL,
                expireAt,
            };
            const { id: userCodeId } = await Utils.createUserCode(userCodeData);

            const response = await request(server).get(
                prefix + `/auth/confirm-email/${code}`,
            );

            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);

            const userCodeRecord = await userCodeRepository.findOneBy({
                id: userCodeId,
            });
            const userRecord = await userRepository.findOneBy({
                id: userData.id,
            });
            expect(userRecord.status).toBe(UserStatus.EMAIL_NOT_CONFIRMED);
            expect(userCodeRecord).toBeInstanceOf(UserCodeEntity);
        });
    });

    afterAll(async () => {
        await app.close();
        await appDataSource.destroy();
        redisClient.disconnect();
    });
});
