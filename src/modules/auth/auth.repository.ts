import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
    CityEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
} from '../../db/entities';
import { BasicUserData, UserInfoData } from '../../common/types';
import { cityRepository, userTokenRepository } from '../../db/repositories';

@Injectable()
export class AuthServiceRepository {
    constructor() {}

    async createUser(
        transactionalEntityManager: EntityManager,
        data: BasicUserData,
    ): Promise<UserEntity> {
        const user = new UserEntity();
        user.memberId = data.memberId;
        user.email = data.email;
        user.password = data.password;
        user.status = data.status;

        await transactionalEntityManager.save(user);
        return user;
    }

    async createCity(
        transactionalEntityManager: EntityManager,
        name: string,
    ): Promise<CityEntity> {
        let city = await cityRepository.findOneBy({
            name,
        });
        if (!(city instanceof Object)) {
            city = new CityEntity();
            city.name = name;
            await transactionalEntityManager.save(city);
        }
        return city;
    }

    async createUserInfo(
        transactionalEntityManager: EntityManager,
        data: UserInfoData,
    ): Promise<void> {
        const userInfo = new UserInfoEntity();
        userInfo.accountName = data.accountName;
        userInfo.city = data.city;
        userInfo.user = data.user;
        userInfo.fullName = data.fullName;
        userInfo.country = data.country;
        userInfo.address = data.address;
        userInfo.phone = data.phone;
        userInfo.zipCode = data.zipCode;
        userInfo.accountType = data.accountType;

        await transactionalEntityManager.save(userInfo);
    }

    async deletePairOfTokens(refreshTokenId: number): Promise<void> {
        await userTokenRepository
            .createQueryBuilder()
            .delete()
            .where('id = :id', { id: refreshTokenId })
            .orWhere('relatedTokenId = :id', { id: refreshTokenId })
            .execute();
    }

    async deleteAllTokens(userId: number): Promise<void> {
        await userTokenRepository
            .createQueryBuilder()
            .delete()
            .where('userId = :userId', { userId })
            .execute();
    }
}
