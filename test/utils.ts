import * as bcrypt from 'bcrypt';
import { userRepository } from '../src/db/repositories';
import { UserStatus } from '../src/common/enums';
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
        await userRepository
            .createQueryBuilder()
            .insert()
            .values(data)
            .execute();
        return { data, password };
    }
}
