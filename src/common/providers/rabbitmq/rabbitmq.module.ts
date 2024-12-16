import { Module } from '@nestjs/common';
import { RabbitmqProvider } from './rabbitmq.provider';
import { ConfigService } from '@nestjs/config';

@Module({
    providers: [
        {
            provide: RabbitmqProvider,
            async useFactory(configService: ConfigService) {
                const provider = new RabbitmqProvider(configService);
                await provider.connect();
                await provider.assertChannels();
                return provider;
            },

            inject: [ConfigService],
        },
    ],
    exports: [RabbitmqProvider],
})
export class RabbitmqModule {}
