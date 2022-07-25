import * as jwtPackage from 'jsonwebtoken';
import { promisify } from 'util';
import { strictEqual as equal } from 'assert';
import { UserTokenEntity } from '../../db/entities';
import { userRepository, userTokenRepository } from '../../db/repositories';
import { JwtSignOptions, PlainRecord } from '../types/other.type';
import { JwtSecretKey, UserTokenType } from '../enums';
import { CacheProvider } from './cache/index';
import { CacheTemplate } from './cache/templates';

const { env } = process;

export class Jwt {
    static secretKeys = {
        api: env.JWT_SECRET,
        admin: env.ADMIN_JWT_SECRET,
    };

    private static methods = {
        sign: promisify(jwtPackage.sign),
        verify: promisify(jwtPackage.verify),
    };

    static async sign(options: JwtSignOptions): Promise<string> {
        return Jwt.methods.sign(
            {
                data: options.data,
            },
            Jwt.secretKeys[options.secretKey],
            { expiresIn: options.expiresIn },
        );
    }

    static async verify(
        token: string,
        secretKey: JwtSecretKey,
    ): Promise<PlainRecord> {
        const { data } = await Jwt.methods.verify(
            token,
            Jwt.secretKeys[secretKey],
        );
        return data;
    }

    static async findInDb(
        data: PlainRecord,
        tokenType: UserTokenType,
    ): Promise<UserTokenEntity | null> {
        /**
         * Searching while dealing with the Refresh token
         */
        if (tokenType == UserTokenType.REFRESH) {
            return userTokenRepository
                .createQueryBuilder('userToken')
                .leftJoinAndSelect('userToken.user', 'user')
                .where('userToken.userId = :userId', data)
                .andWhere('userToken.code = :code', data)
                .andWhere('userToken.type = :tokenType', { tokenType })
                .getOne();
        } else {
            /**
             * Dealing with the Access token
             */
            const identifier = `${data.code}${data.userId}`;
            const cacheRecord = await CacheProvider.build({
                template: CacheTemplate.API_ACCESS_TOKEN,
                identifier,
                data,
            }).findOrSave();
            if (!(cacheRecord instanceof Object)) {
                return null;
            }
            const user = await userRepository.findOneBy({
                id: +data.userId,
            });
            const userToken = new UserTokenEntity();
            userToken.expireAt = new Date(+cacheRecord.expireAt);
            userToken.user = user;

            return userToken;
        }
    }

    static validate(token: UserTokenEntity): void | never {
        equal(token.expireAt > new Date(), true);
        equal(token.user.status > 0, true);
    }
}
