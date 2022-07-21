import {
    CacheModifyParams,
    CacheRecordOptions,
} from 'src/common/types/other.type';
import { redisClient } from '../redis';

export class CacheProvider {
    constructor(private key: string) {}

    /**
     * Create and return an instance of the class
     */
    static build({ template, identifier }: CacheRecordOptions): CacheProvider {
        const index = template.indexOf('#');
        const key =
            template.slice(0, index) + identifier + template.slice(index + 1);

        return new CacheProvider(key);
    }

    /**
     * Find a record by a key
     */
    find(): Promise<string | null> {
        return redisClient.get(this.key);
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
     * Remove a record by a key
     */
    async remove(): Promise<void> {
        await redisClient.del(this.key);
    }
}
