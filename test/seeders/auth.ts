import { faker } from '@faker-js/faker';
import { UserStatus } from '../../src/common/enums';

export class AuthSeeder {
    static get ['sign-up.user']() {
        return {
            accountName: faker.name.findName(),
            fullName: faker.name.firstName(),
            city: faker.address.city(),
            address: faker.address.secondaryAddress(),
            country: 'Greece',
            zipCode: faker.datatype.number({ max: 100000 }),
            phone: faker.phone.phoneNumber(),
            accountType: 'Personal',
            email: faker.internet.email(),
            password: faker.internet.password(),
        };
    }

    static get ['basic.user']() {
        return {
            memberId: faker.datatype.number({ max: 100000 }),
            email: faker.internet.email(),
            password: faker.internet.password(),
            salt: 'AAAAA',
            status: UserStatus.EMAIL_NOT_CONFIRMED,
        };
    }
}
