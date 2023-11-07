import helmet from 'helmet';
import { promisify } from 'node:util';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { init as i18nextInit } from './common/providers/i18next';
import { AppModule } from './modules/app.module';
import { appDataSource } from './db/dataSource';
import { redisClient } from './common/providers/redis';
import { Mailer } from './common/providers/mailer/index';
import { Logger } from './common/providers/loggers/system';

const logger = Logger.getInstance();

export default class Bootstrap {
    private app: INestApplication;

    /**
     * Run the logic of the class
     */
    async run() {
        await i18nextInit();

        this.app = await NestFactory.create(AppModule, {
            cors: true,
            logger,
        });
        try {
            await this.connectExternalStorages();
        } catch (error) {
            logger.error(error);
            process.exit(1);
        }
        this.buildSwagger();
        this.miscellaneousSettings();
        this.listen();
    }

    /**
     * Establish a connection with external storages
     */
    private async connectExternalStorages() {
        try {
            await appDataSource.initialize();
        } catch (error) {
            logger.error(error);
            throw new Error('Failed to connect to database');
        }
        try {
            await promisify(redisClient.ping.bind(redisClient))();
        } catch (error) {
            logger.error(error);
            throw new Error('Cannot connect to Redis');
        }
    }

    /**
     * Perform various settings
     */
    private miscellaneousSettings() {
        Mailer.setTransporter();
        this.app.useGlobalPipes(new ValidationPipe());
        this.app.use(helmet());
    }

    /**
     * Compile and set up swagger
     */
    private buildSwagger() {
        const swaggerConfig = new DocumentBuilder()
            .setTitle('Payment-System')
            .setDescription('The API of the "Payment-System"')
            .setVersion('1.0')
            .build();
        const document = SwaggerModule.createDocument(this.app, swaggerConfig, {
            ignoreGlobalPrefix: false,
        });
        SwaggerModule.setup('api', this.app, document); // @todo: retrive prefix from config
    }

    /**
     * Start listening to incoming requests
     */
    private listen() {
        const configService = this.app.get(ConfigService);
        const port = configService.get<number>('APP_PORT');

        this.app.listen(port, () => {
            logger.log(`The app started at the port: ${port}`);
        });
    }
}
