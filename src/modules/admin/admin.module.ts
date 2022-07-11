import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [AuthModule],
})
export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {}
}
