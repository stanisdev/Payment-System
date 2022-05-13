import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthServiceRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { getJwtTokenMiddleware } from 'src/common/middlewares/get-jwt-token.middleware';

@Module({
    controllers: [AuthController],
    providers: [AuthService, AuthServiceRepository, ConfigService],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(getJwtTokenMiddleware).forRoutes('/auth/logout');
    }
}
