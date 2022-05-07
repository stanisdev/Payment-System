import * as jwtPackage from 'jsonwebtoken';
import { promisify } from 'util';
import { JwtSignOptions, PlainHashMap } from '../common/types';

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

    static async verify(token: string): Promise<PlainHashMap> {
        const { data } = await Jwt.methods.verify(
            token,
            process.env.JWT_SECRET,
        );
        return data;
    }
}
