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
import { LoggerProvider } from './common/providers/logger/logger.provider';

export default class Bootstrap {
    private app: INestApplication;
    private config: ConfigService;
    private logger: LoggerProvider;

    /**
     * Run the logic of the class
     */
    async run() {
        await i18nextInit();

        this.app = await NestFactory.create(AppModule, {
            cors: true,
            logger: false,
        });
        this.logger = this.app.get(LoggerProvider);
        this.config = this.app.get(ConfigService);
        try {
            await this.connectExternalStorages();
        } catch (error) {
            this.logger.error(error);
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
            this.logger.error(error);
            throw new Error('Failed to connect to database');
        }
        try {
            await promisify(redisClient.ping.bind(redisClient))();
        } catch (error) {
            this.logger.error(error);
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
        const { config } = this;
        const prefix = config.get<string>('SWAGGER_PREFIX');
        const version = config.get<string>('SWAGGER_VERSION');

        const swaggerConfig = new DocumentBuilder()
            .setTitle('Payment-System')
            .setDescription('The API of the "Payment-System"')
            .setVersion(version)
            .build();
        const document = SwaggerModule.createDocument(this.app, swaggerConfig, {
            ignoreGlobalPrefix: false,
            deepScanRoutes: true,
        });
        SwaggerModule.setup(prefix, this.app, document);
    }

    /**
     * Start listening to incoming requests
     */
    private listen() {
        const port = this.config.get<number>('APP_PORT');

        this.app.listen(port, () => {
            this.logger.log(`The app started at the port: ${port}`);
        });
    }
}
