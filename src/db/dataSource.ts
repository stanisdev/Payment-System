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

dotenv.config({
    path: `.${env.NODE_ENV}.env`
});

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
    migrations: ['migrations/**/*{.ts,.js}'],
});
