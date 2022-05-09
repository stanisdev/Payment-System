import Redis from 'ioredis';
import { RedisOptions } from 'ioredis';

const { env } = process;

const credentials: RedisOptions = {
    port: +env.REDIS_PORT,
    host: env.REDIS_HOST,
    db: +env.REDIS_DB,
};
if (env.REDIS_USERNAME?.length > 0) {
    credentials.username = env.REDIS_USERNAME;
}
if (env.REDIS_PASSWORD?.length > 0) {
    credentials.password = env.REDIS_PASSWORD;
}

export const redisClient = new Redis(credentials);
