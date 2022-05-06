import { DataSource } from 'typeorm';
import { UserEntity, UserInfoEntity, CityEntity } from './entities';
import * as dotenv from 'dotenv';

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
    entities: [UserEntity, UserInfoEntity, CityEntity],
    migrations: ['migrations/**/*{.ts,.js}'],
});
