import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();
const { env } = process;

export const connectionSource = new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: +env.DB_PORT,
    username: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    logging: Boolean(env.DB_LOGGING),
    synchronize: false,
    name: 'default',
    entities: ['src/db/entities/**{.ts,.js}'],
    migrations: ['src/db/migrations/**/*{.ts,.js}'],
});
