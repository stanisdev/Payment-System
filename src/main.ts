import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { init as i18nextInit } from './common/i18next';
import { AppModule } from './modules/app.module';
import { appDataSource } from './db/dataSource';
import { redisClient } from './common/redis';
import { Mailer } from './common/mailer/index';

async function bootstrap() {
    await appDataSource.initialize();
    await redisClient.ping();
    await i18nextInit();

    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const mailer = app.get(Mailer);
    mailer.setTransporter();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Perfect money')
        .setDescription('The API of the service "Perfect money"')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        ignoreGlobalPrefix: false,
    });
    SwaggerModule.setup('api', app, document);

    app.setGlobalPrefix(configService.get('API_PREFIX'));
    app.useGlobalPipes(new ValidationPipe());

    const port = configService.get<number>('APP_PORT');
    app.listen(port, () => {
        console.log('App started at ', port); // @todo: use a logger
    });
}
bootstrap();
