import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { AdminModule } from './admin/admin.module';
import { ApiModule } from './api/api.module';

const { env } = process;
const apiType = env.API_TYPE;
let modules: typeof ApiModule[] = [];

if (apiType == 'api') {
    modules.push(ApiModule);
} else if (apiType == 'admin') {
    modules.push(AdminModule);
} else if (env.NODE_ENV !== 'production') {
    modules.push(ApiModule, AdminModule);
} else {
    throw new Error('Define at least one core module to run the application');
}

@Module({
    imports: [ConfigModule.forRoot({}), ...modules],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
