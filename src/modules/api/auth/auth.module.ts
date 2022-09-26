import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { getJwtTokenMiddleware } from '../../../common/middlewares/get-jwt-token.middleware';
import { WalletModule } from '../wallet/wallet.module';
import { WalletSharedService } from '../wallet/wallet.shared';
import { WalletServiceRepository } from '../wallet/wallet.repository';

@Module({
    imports: [WalletModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        AuthServiceRepository,
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
