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

    validate({ expireAt, user }: UserTokenEntity): void | never {
        equal(expireAt > new Date(), true);
        equal(user.status > 0, true);
    }

    async getTokenInstance(
        searchCriteria: PlainRecord,
    ): Promise<UserTokenEntity> {
        const { code, userId } = searchCriteria;
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
            const cacheRecord = await CacheProvider.build({
                template: CacheTemplate.API_ACCESS_TOKEN,
                identifier,
                data: searchCriteria,
            }).findOrSave();

            if (!(cacheRecord instanceof Object)) {
                return null;
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
