import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthServiceRepository } from './auth.repository';
import { SignUpDto } from './dto/sign-up.dto';
import { Utils } from '../../common/utils';

@Injectable()
export class AuthService {
    constructor(private readonly repository: AuthServiceRepository) {}

    /**
     * Register a new user by creating appropriate
     * records in the DB
     */
    async signUp(signUpDto: SignUpDto): Promise<{}> {
        const memberId = await this.generateMemberId();

        const userData = {
            memberId,
            email: signUpDto.email,
            password: signUpDto.password,
            status: 1,
        };
        const user = await this.repository.createUser(userData);
        const city = await this.repository.createCity(signUpDto.city);
        const userInfoData = {
            ...signUpDto,
            user,
            city,
        };
        await this.repository.createUserInfo(userInfoData);
        return {};
    }

    /**
     * Generate and get a unique "memberId" of
     * the being created user
     */
    private async generateMemberId(): Promise<number> {
        let memberId: number;
        for (let a = 0; a < 100; a++) {
            memberId = +(await Utils.generateRandomString({
                onlyDigits: true,
                length: 7,
            }));
            const user = await this.repository.userRepository.findOneBy({
                memberId,
            });
            if (!(user instanceof Object)) {
                return memberId;
            }
        }
        throw new InternalServerErrorException('User cannot be created');
    }
}
