import * as jwtPackage from 'jsonwebtoken';
import { promisify } from 'util';
import { strictEqual as equal } from 'assert';
import { UserTokenEntity } from 'src/db/entities';
import { userTokenRepository } from 'src/db/repositories';
import {
    JwtSignOptions,
    JwtValidateOptions,
    PlainRecord,
} from '../common/types';

export class Jwt {
    private static methods = {
        sign: promisify(jwtPackage.sign),
        verify: promisify(jwtPackage.verify),
    };

    static async sign(options: JwtSignOptions): Promise<string> {
        return Jwt.methods.sign(
            {
                data: options.data,
            },
            process.env.JWT_SECRET,
            { expiresIn: options.expiresIn },
        );
    }

    static async verify(token: string): Promise<PlainRecord> {
        const { data } = await Jwt.methods.verify(
            token,
            process.env.JWT_SECRET,
        );
        return data;
    }

    static async findInDb(data: PlainRecord): Promise<UserTokenEntity> {
        return userTokenRepository
            .createQueryBuilder('userToken')
            .leftJoinAndSelect('userToken.user', 'user')
            .where('userToken.userId = :userId', data)
            .andWhere('userToken.code = :code', data)
            .getOne();
    }

    static validate(options: JwtValidateOptions): void | never {
        const { token, data, type } = options;
        const { user } = token;

        equal(token.type, type);
        equal(token.expireAt > new Date(), true);
        equal(user.id, data.userId);
        equal(user.status > 0, true);
    }
}
