import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './repositories/auth.repository';
import { ConfigService } from '@nestjs/config';
import { getJwtTokenMiddleware } from '../../../common/middlewares/get-jwt-token.middleware';
import { WalletModule } from '../wallet/wallet.module';
import { WalletSharedService } from '../wallet/wallet.shared';
import { WalletServiceRepository } from '../wallet/wallet.repository';
import { AuthUtility } from './auth.utility';
import { CacheModule } from 'src/common/providers/cache/cache.module';
import { RabbitmqModule } from 'src/common/providers/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        WalletModule,
        CacheModule,
        RabbitmqModule,
        JwtModule.register({}),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthServiceRepository,
        AuthUtility,
        ConfigService,
        WalletSharedService,
        WalletServiceRepository,
    ],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(getJwtTokenMiddleware).forRoutes('/auth/logout');
    }
}
