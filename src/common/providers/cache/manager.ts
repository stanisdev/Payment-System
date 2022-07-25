import { userTokenRepository } from '../../../db/repositories';
import { PlainRecord } from '../../../common/types/other.type';
import { CacheTemplate } from './templates';
import { UserTokenType } from '../../../common/enums';
import { UserTokenEntity } from '../../../db/entities';
import { redisClient } from '../redis';
import { CacheProvider } from './index';

export class CacheManager {
    constructor(private provider: CacheProvider) {}

    /**
     * Execute a method that was chosen by the provider
     */
    execute(): Promise<PlainRecord | null> {
        return this[this.provider.template]();
    }

    /**
     *  Service the basic data of an Access token
     */
    async [CacheTemplate.API_ACCESS_TOKEN](): Promise<PlainRecord | null> {
        const { data, key } = this.provider;
        const userToken = await userTokenRepository
            .createQueryBuilder('userToken')
            .where('userToken.userId = :userId', data)
            .andWhere('userToken.code = :code', data)
            .andWhere('userToken.type = :tokenType', {
                tokenType: UserTokenType.ACCESS,
            })
            .getOne();

        if (!(userToken instanceof UserTokenEntity)) {
            return null;
        }
        const cacheRecord = {
            expireAt: userToken.expireAt.getTime(),
        };
        const ttl = Math.round((cacheRecord.expireAt - Date.now()) / 1000);
        await redisClient.hmset(key, cacheRecord);
        await redisClient.expire(key, ttl);

        return cacheRecord;
    }
}
