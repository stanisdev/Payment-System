import { registerAs } from '@nestjs/config';

const { env } = process;

export default registerAs('database', () => {
    return {
        host: env.DB_HOST,
        name: env.DB_NAME,
        port: env.DB_PORT,
        password: env.DATABASE_PASSWORD,
        user: env.DATABASE_USER,
        logging: env.DB_LOGGING,
    };
});
