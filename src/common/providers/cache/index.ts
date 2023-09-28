import {
    CacheModifyParams,
    CacheRecordOptions,
    PlainRecord,
    RedisHash,
} from 'src/common/types/other.type';
import { redisClient } from '../redis';
import { CacheTemplate } from './templates';

export class CacheProvider {
    private constructor(
        public template: CacheTemplate,
        public key: string,
        public data: PlainRecord = {},
    ) {}

    /**
     * Create and return an instance of the class
     */
    static build({
        template,
        identifier,
        data,
    }: CacheRecordOptions): CacheProvider {
        const substituteIndex = template.indexOf('#');
        const key =
            template.slice(0, substituteIndex) +
            identifier +
            template.slice(substituteIndex + 1);

        return new CacheProvider(template, key, data);
    }

    /**
     * Find a record by a key
     */
    find(): Promise<string | null> {
        return redisClient.get(this.key);
    }

    /**
     * Find a hash by the key
     */
    async findHash(): Promise<RedisHash | null> {
        const record: unknown = await redisClient.hgetall(this.key);

        if (!(record instanceof Object) || Object.keys(record).length < 1) {
            return null;
        }
        return <RedisHash>record;
    }

    /**
     * Insert or update an existing record
     */
    async save({ increase, expiration }: CacheModifyParams): Promise<void> {
        if (increase === true) {
            await redisClient.incr(this.key);
        }
        if (Number.isInteger(expiration)) {
            await redisClient.expire(this.key, expiration);
        }
    }

    /**
     * Save a hash with the given key
     */
    async saveHash(hash: RedisHash): Promise<void> {
        await redisClient.hmset(this.key, hash);
    }

    /**
     * Set a ttl to the record with the given key
     */
    async setTtl(seconds: number) {
        await redisClient.expire(this.key, seconds);
    }

    /**
     * Remove a record with the key
     */
    async remove(): Promise<void> {
        await redisClient.del(this.key);
    }
}
