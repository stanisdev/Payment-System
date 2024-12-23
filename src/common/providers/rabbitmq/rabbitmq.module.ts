import { Module } from '@nestjs/common';
import { RabbitmqProvider } from './rabbitmq.provider';
import { ConfigService } from '@nestjs/config';
import { LoggerProvider } from '../logger/logger.provider';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [LoggerModule],
    providers: [
        {
            provide: RabbitmqProvider,
            async useFactory(
                configService: ConfigService,
                logger: LoggerProvider,
            ) {
                const provider = new RabbitmqProvider(configService, logger);
                await provider.connect();
                await provider.assertChannels();
                return provider;
            },
            inject: [ConfigService, LoggerProvider],
        },
    ],
    exports: [RabbitmqProvider],
})
export class RabbitmqModule {}
