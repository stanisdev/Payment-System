import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from '../common/middlewares/logger.middleware';
import { AdminModule } from './admin/admin.module';
import { ApiModule } from './api/api.module';
import databaseConfig from 'src/config/database.config';
import restrictionsConfig from 'src/config/restrictions.config';
import miscellaneousConfig from 'src/config/miscellaneous.config';
import jwtConfig from 'src/config/jwt.config';
import { FeeModule } from 'src/common/providers/fee/fee.module';
import { CacheModule } from 'src/common/providers/cache/cache.module';
import { RabbitmqModule } from 'src/common/providers/rabbitmq/rabbitmq.module';
import rabbitmqConfig from 'src/config/rabbitmq.config';
import { LoggerModule } from 'src/common/providers/logger/logger.module';

const { env } = process;
const apiType = env.API_TYPE;

const modules: (typeof ApiModule)[] = [];

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
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                databaseConfig,
                restrictionsConfig,
                miscellaneousConfig,
                rabbitmqConfig,
                jwtConfig,
            ],
        }),
        LoggerModule,
        FeeModule,
        CacheModule,
        RabbitmqModule,
        ...modules,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
