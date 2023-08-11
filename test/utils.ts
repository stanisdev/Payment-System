import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { userCodeRepository, userRepository } from '../src/db/repositories';
import { UserAction, UserStatus } from '../src/common/enums';
import { AuthSeeder } from './seeders/auth';

export class Utils {
    static async createUserAndGetData(status?: UserStatus) {
        const data = AuthSeeder['basic.user'];
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(data.password + data.salt, salt);
        const { password } = data;
        data.password = hash;

        if (typeof status == 'undefined') {
            data.status = UserStatus.EMAIL_CONFIRMED;
        }
        data.status = status;
        const insertResult = await userRepository
            .createQueryBuilder()
            .insert()
            .values(data)
            .execute();

        const [{ id }] = insertResult.raw;
        return { id: +id, data, password };
    }

    static async createUserCode(data: {
        userId: number;
        code: string;
        action: UserAction;
        expireAt: Date;
    }) {
        const insertResult = await userCodeRepository
            .createQueryBuilder()
            .insert()
            .values(data)
            .execute();
        const [{ id }] = insertResult.raw;
        return { id };
    }

    static generateNumber(min: number, max: number): number {
        return Number(faker.number.int({ min, max }));
    }
}
