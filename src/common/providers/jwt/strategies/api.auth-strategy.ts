import { strictEqual as equal } from 'assert';
import { UserTokenType } from 'src/common/enums';
import { AuthStrategy } from 'src/common/interfaces';
import { PlainRecord } from 'src/common/types/other.type';
import { UserTokenEntity } from 'src/db/entities';
import { userRepository, userTokenRepository } from 'src/db/repositories';
import { CacheProvider } from '../../cache';
import { CacheTemplate } from '../../cache/templates';

const { env } = process;

export class ApiAuthStrategy implements AuthStrategy<UserTokenEntity> {
    constructor(
        private tokenType: UserTokenType,
        public readonly secretKey: string = env.JWT_SECRET,
    ) {}

    checkAdmission({ expireAt, user }: UserTokenEntity): void | never {
        equal(expireAt > new Date(), true);
        equal(user.status > 0, true);
    }

    validateDecryptedData(decryptedData: PlainRecord): void | never {
        const { code, userId } = decryptedData;

        equal(Number.isInteger(userId), true);
        equal(<number>userId > 0, true);
        equal(typeof code, 'string');
    }

    async getTokenInstance(
        searchCriteria: PlainRecord,
    ): Promise<UserTokenEntity> {
        const code = <string>searchCriteria.code;
        const userId = <number>searchCriteria.userId;

        /**
         * Searching while dealing with the Refresh token
         */
        if (this.tokenType == UserTokenType.REFRESH) {
            return userTokenRepository
                .createQueryBuilder('userToken')
                .leftJoinAndSelect('userToken.user', 'user')
                .where('userToken.userId = :userId', { userId })
                .andWhere('userToken.code = :code', { code })
                .andWhere('userToken.type = :tokenType', {
                    tokenType: this.tokenType,
                })
                .getOne();
        } else {
            /**
             * Dealing with the Access token
             */
            const identifier = `${code}${userId}`;
            const cacheProvider = CacheProvider.build({
                template: CacheTemplate.API_ACCESS_TOKEN,
                identifier,
            });
            let cacheRecord = await cacheProvider.findHash();

            /**
             * If access token params not found in the cache
             */
            if (!(cacheRecord instanceof Object)) {
                const userToken = await userTokenRepository
                    .createQueryBuilder('userToken')
                    .where('userToken.userId = :userId', { userId })
                    .andWhere('userToken.code = :code', { code })
                    .andWhere('userToken.type = :tokenType', {
                        tokenType: UserTokenType.ACCESS,
                    })
                    .getOne();
                /**
                 * The given access token has unrecognizable security code
                 */
                if (!(userToken instanceof UserTokenEntity)) {
                    return null;
                }
                const expirationTimestamp = userToken.expireAt.getTime();
                const ttl = Math.round(
                    (expirationTimestamp - Date.now()) / 1000,
                );
                cacheRecord = {
                    expireAt: expirationTimestamp.toString(),
                };
                /**
                 * Save access token expiration date to the cache
                 */
                await cacheProvider.saveHash(cacheRecord);
                await cacheProvider.setTtl(ttl);
            }
            const user = await userRepository.findOneBy({
                id: +userId,
            });
            const tokenInstance = new UserTokenEntity();
            tokenInstance.expireAt = new Date(+cacheRecord.expireAt);
            tokenInstance.user = user;

            return tokenInstance;
        }
    }
}
