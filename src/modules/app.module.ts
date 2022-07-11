import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { AdminModule } from './admin/admin.module';
import { ApiModule } from './api/api.module';

@Module({
    imports: [ConfigModule.forRoot({}), ApiModule, AdminModule],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
