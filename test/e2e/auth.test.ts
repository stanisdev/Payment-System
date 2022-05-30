import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { HttpServer, INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/modules/app.module';
import { appDataSource } from '../../src/db/dataSource';
import { redisClient } from '../../src/common/redis';
import { faker } from '@faker-js/faker';

describe('Auth controller', () => {
    let app: INestApplication;
    let server: HttpServer;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        await appDataSource.initialize();
        await app.init();

        server = app.getHttpServer();
    });

    describe('POST: /auth/sign-up', () => {
        test('It should register a new user', async () => {});
    });

    afterAll(async () => {
        await app.close();
        await appDataSource.destroy();
        redisClient.disconnect();
    });
});
