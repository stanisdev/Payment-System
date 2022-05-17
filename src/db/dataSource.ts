import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {
    UserEntity,
    UserInfoEntity,
    CityEntity,
    UserTokenEntity,
    UserLogEntity,
    WalletEntity,
    WalletTypeEntity,
    WalletCategoryEntity,
    UserCodeEntity,
} from './entities';

dotenv.config();
const { env } = process;

export const appDataSource = new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: +env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logging: Boolean(env.DB_LOGGING),
    synchronize: false,
    name: 'default',
    entities: [
        UserEntity,
        UserInfoEntity,
        CityEntity,
        UserTokenEntity,
        UserLogEntity,
        UserCodeEntity,
        WalletEntity,
        WalletTypeEntity,
        WalletCategoryEntity,
    ],
    migrations: ['migrations/**/*{.ts,.js}'],
});
