import { nanoid, customAlphabet } from 'nanoid/async';
import { RandomStringOptions } from './types/other.type';

export class Utils {
    static async generateRandomString(
        options: RandomStringOptions,
    ): Promise<string> {
        if (options.onlyDigits) {
            return customAlphabet('1234567890')(options.length);
        } else {
            return await nanoid(options.length);
        }
    }
}
