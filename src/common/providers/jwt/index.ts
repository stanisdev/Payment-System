import * as jwtPackage from 'jsonwebtoken';
import { promisify } from 'util';
import { JwtSignParams, PlainRecord } from '../../../common/types/other.type';
import { AuthStrategy } from '../../../common/interfaces';

const sign = promisify(jwtPackage.sign);
const verify = promisify(jwtPackage.verify);

export class Jwt<T> {
    constructor(private strategy: AuthStrategy<T>) {}

    /**
     * Generate an encrypted token
     */
    sign({ data, expiresIn }: JwtSignParams): Promise<string> {
        return sign({ data }, this.strategy.secretKey, { expiresIn });
    }

    /**
     * Check validity of the given token and get the decrypted data
     */
    async verify(encryptedToken: string): Promise<PlainRecord> {
        const { data } = await verify(encryptedToken, this.strategy.secretKey);
        return data;
    }

    /**
     * Get a using strategy
     */
    getStrategy(): AuthStrategy<T> {
        return this.strategy;
    }
}
