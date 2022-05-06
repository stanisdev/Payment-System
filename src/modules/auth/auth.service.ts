import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthServiceRepository } from './auth.repository';
import { userRepository } from '../../db/repositories';
import { SignUpDto } from './dto/sign-up.dto';
import { Utils } from '../../common/utils';
import { appDataSource } from '../../db/dataSource';
import { EntityManager } from 'typeorm';

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
        await appDataSource.manager.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const user = await this.repository.createUser(
                    transactionalEntityManager,
                    userData,
                );
                const city = await this.repository.createCity(
                    transactionalEntityManager,
                    signUpDto.city,
                );
                const userInfoData = {
                    ...signUpDto,
                    user,
                    city,
                };
                await this.repository.createUserInfo(
                    transactionalEntityManager,
                    userInfoData,
                );
            },
        );
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
            const user = await userRepository.findOneBy({
                memberId,
            });
            if (!(user instanceof Object)) {
                return memberId;
            }
        }
        throw new InternalServerErrorException('User cannot be created');
    }
}
