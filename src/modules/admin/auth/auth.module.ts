import { AuthController } from './auth.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

@Module({
    controllers: [AuthController],
})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
