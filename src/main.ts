import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { init as i18nextInit } from './common/providers/i18next';
import { AppModule } from './modules/app.module';
import { appDataSource } from './db/dataSource';
import { redisClient } from './common/providers/redis';
import { Mailer } from './common/mailer/index';
import { Logger } from './common/helpers/logger';

async function bootstrap() {
    await appDataSource.initialize();
    await redisClient.ping();
    await i18nextInit();

    const logger = Logger.getInstance();
    const app = await NestFactory.create(AppModule, {
        cors: true,
        logger,
    });
    const configService = app.get(ConfigService);
    Mailer.setTransporter();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Perfect money')
        .setDescription('The API of the service "Perfect money"')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup('api', app, document);
    app.useGlobalPipes(new ValidationPipe());
    app.use(helmet());

    const port = configService.get<number>('APP_PORT');
    app.listen(port, () => {
        logger.log(`The app started at the port: ${port}`);
    });
}
bootstrap();
