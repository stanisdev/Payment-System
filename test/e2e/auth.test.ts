import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment';
import { Test } from '@nestjs/testing';
import {
    HttpServer,
    HttpStatus,
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module';
import { appDataSource } from '../../src/db/dataSource';
import { redisClient } from '../../src/common/redis';
import { Mailer } from '../../src/common/mailer';
import { userRepository } from '../../src/db/repositories';
import { UserEntity } from '../../src/db/entities';
import { UserStatus, UserAction } from '../../src/common/enums';
import { AuthSeeder } from '../seeders/auth';
const { env } = process;

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
                .post('/auth/sign-up')
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
            expect(user.info.zipCode).toBe(data.zipCode);
            expect(user.info.phone).toBe(data.phone);
            expect(user.info.accountType).toBe(data.accountType);
            expect(user.status).toBe(UserStatus.EMAIL_NOT_CONFIRMED);

            const match = await bcrypt.compare(
                data.password + user.salt,
                user.password,
            );
            expect(match).toBe(true);

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
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since the passed "accountType" parameter is incorrect', async () => {
            const data = AuthSeeder['sign-up.user'];
            data.accountType = 'unknownType';

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since the passed email is incorrect', async () => {
            const data = AuthSeeder['sign-up.user'];
            data.email = 'what?';

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a password has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.password;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a full name has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.fullName;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a city has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.city;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a country has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.country;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a zip code has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.zipCode;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since a phone has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.phone;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });

        test('It should restrict registering a new user since an email has not been passed', async () => {
            const data = AuthSeeder['sign-up.user'];
            delete data.email;

            const response = await request(server)
                .post('/auth/sign-up')
                .send(data);
            expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
        });
    });

    afterAll(async () => {
        await app.close();
        await appDataSource.destroy();
        redisClient.disconnect();
    });
});
