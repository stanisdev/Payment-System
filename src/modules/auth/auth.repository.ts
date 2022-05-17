import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
    CityEntity,
    UserCodeEntity,
    UserEntity,
    UserInfoEntity,
} from '../../db/entities';
import {
    BasicUserCodeData,
    BasicUserData,
    UserInfoData,
} from '../../common/types';
import {
    cityRepository,
    userCodeRepository,
    userTokenRepository,
} from '../../db/repositories';
import { UserAction } from 'src/common/enums';

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
        transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(UserInfoEntity)
            .values(data)
            .execute();
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

    async createUserCode({
        user,
        code,
        action,
        expireAt,
    }: BasicUserCodeData): Promise<void> {
        await userCodeRepository
            .createQueryBuilder()
            .insert()
            .values({
                user,
                code,
                action,
                expireAt,
            })
            .execute();
    }

    async findUserCode(
        code: string,
        action: UserAction,
    ): Promise<UserCodeEntity> {
        return userCodeRepository
            .createQueryBuilder('userCode')
            .leftJoinAndSelect('userCode.user', 'user')
            .where('userCode.code = :code', { code })
            .andWhere('userCode.action = :action', { action })
            .getOne();
    }
}
