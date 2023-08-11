import { faker } from '@faker-js/faker';
import { UserStatus } from '../../src/common/enums';
import { Utils } from '../utils';

export class AuthSeeder {
    static get ['sign-up.user']() {
        return {
            accountName: faker.person.firstName(),
            fullName: faker.person.fullName(),
            city: faker.location.city(),
            address: faker.location.streetAddress(),
            country: 'Greece',
            zipCode: Utils.generateNumber(1000000, 9999999),
            phone: faker.phone.number(),
            accountType: 'Personal',
            email: faker.internet.email(),
            password: faker.internet.password(),
        };
    }

    static get ['basic.user']() {
        return {
            memberId: Utils.generateNumber(10000, 999999),
            email: faker.internet.email(),
            password: faker.internet.password(),
            salt: 'AAAAA',
            status: UserStatus.EMAIL_NOT_CONFIRMED,
        };
    }

    static get ['broken-jwt-token']() {
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZX.m4Ah';
    }
}
