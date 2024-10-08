import { DataSource } from 'typeorm';
import {
    UserEntity,
    UserInfoEntity,
    CityEntity,
    UserTokenEntity,
    UserLogEntity,
    WalletEntity,
    CurrencyEntity,
    CurrencyCategoryEntity,
    UserCodeEntity,
    PayeeEntity,
    TransferEntity,
    ClientEntity,
    AdminEntity,
    AdminLogEntity,
    RoleEntity,
    AdminTokenEntity,
    SystemIncomeEntity,
    FeeEntity,
} from './entities';

const { env } = process;

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
        CurrencyCategoryEntity,
        PayeeEntity,
        TransferEntity,
        ClientEntity,
        AdminEntity,
        AdminLogEntity,
        RoleEntity,
        AdminTokenEntity,
        SystemIncomeEntity,
        FeeEntity,
    ],
    migrations: migrationsPath,
});
