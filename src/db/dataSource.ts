import { DataSource } from 'typeorm';
import { compileConfig } from '../common/providers/compileConfig';
import {
    UserEntity,
    UserInfoEntity,
    CityEntity,
    UserTokenEntity,
    UserLogEntity,
    WalletEntity,
    CurrencyEntity,
    WalletCategoryEntity,
    UserCodeEntity,
    PayeeEntity,
    TransferEntity,
    ClientEntity,
    AdminEntity,
    AdminLogEntity,
    RoleEntity,
    AdminTokenEntity,
} from './entities';

const { env } = process;
compileConfig();

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
        CurrencyEntity,
        WalletCategoryEntity,
        PayeeEntity,
        TransferEntity,
        ClientEntity,
        AdminEntity,
        AdminLogEntity,
        RoleEntity,
        AdminTokenEntity,
    ],
    migrations: migrationsPath,
});
