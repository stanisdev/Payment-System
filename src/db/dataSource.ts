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
    PayeeEntity,
    TransferEntity,
    ClientEntity,
} from './entities';

const { env } = process;
if (typeof env.NODE_ENV != 'string') {
    throw new Error('The "NODE_ENV" environment variable is not defined');
}
dotenv.config({
    path: `.${env.NODE_ENV}.env`,
});

let migrationsPath: string[];
if (typeof env.MIGRATION_MODE == 'string') {
    migrationsPath = ['src/db/migrations/**/*{.ts,.js}'];
} else {
    migrationsPath = [];
}

export const appDataSource = new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: +env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logging: Boolean(+env.DB_LOGGING),
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
        PayeeEntity,
        TransferEntity,
        ClientEntity,
    ],
    migrations: migrationsPath,
});
