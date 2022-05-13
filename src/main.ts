import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './modules/app.module';
import { appDataSource } from './db/dataSource';
import { redisClient } from './common/redis';
import { init as i18nextInit } from './common/i18next';

async function bootstrap() {
    await appDataSource.initialize();
    await redisClient.ping();
    await i18nextInit();

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix(configService.get('API_PREFIX'));
    app.useGlobalPipes(new ValidationPipe());

    const port = configService.get<number>('APP_PORT');
    await app.listen(port);
}
bootstrap();
