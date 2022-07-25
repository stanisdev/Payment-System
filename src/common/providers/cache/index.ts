import {
    CacheModifyParams,
    CacheRecordOptions,
    PlainRecord,
} from 'src/common/types/other.type';
import { redisClient } from '../redis';
import { CacheManager } from './manager';
import { CacheTemplate } from './templates';

export class CacheProvider {
    constructor(
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
        const index = template.indexOf('#');
        const key =
            template.slice(0, index) + identifier + template.slice(index + 1);

        return new CacheProvider(template, key, data);
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

    /**
     * Try to find a hash in the Cache. If the searching
     * failed then create a new one
     */
    async findOrSave(): Promise<PlainRecord | null> {
        const record: PlainRecord = await redisClient.hgetall(this.key);

        if (Object.keys(record).length < 1) {
            const manager = new CacheManager(this);
            return manager.execute();
        }
        return record;
    }
}
