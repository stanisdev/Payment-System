import { Injectable } from '@nestjs/common';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import {
    CityEntity,
    UserCodeEntity,
    UserEntity,
    UserInfoEntity,
    UserTokenEntity,
} from '../../../db/entities';
import {
    UserCodeData,
    FullUserInfo,
    UserInfoData,
} from '../../../common/types/user.type';
import {
    cityRepository,
    userCodeRepository,
    userTokenRepository,
} from '../../../db/repositories';
import { UserAction, UserTokenType } from '../../../common/enums';

@Injectable()
export class AuthServiceRepository {
    async createUser(
        data: FullUserInfo,
        transactionalEntityManager: EntityManager,
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
        name: string,
        transactionalEntityManager: EntityManager,
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
        data: UserInfoData,
        transactionalEntityManager: EntityManager,
    ): Promise<void> {
        await transactionalEntityManager
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

    async createUserCode(
        { user, code, action, expireAt }: UserCodeData,
        transactionalEntityManager?: EntityManager,
    ): Promise<void> {
        let queryBuilder: SelectQueryBuilder<UserCodeEntity>;

        if (transactionalEntityManager) {
            queryBuilder = transactionalEntityManager.createQueryBuilder();
        } else {
            queryBuilder = userCodeRepository.createQueryBuilder();
        }
        await queryBuilder
            .insert()
            .into(UserCodeEntity)
            .values({
                user,
                code,
                action,
                expireAt,
            })
            .execute();
    }

    findUserCode(code: string, action: UserAction): Promise<UserCodeEntity> {
        return userCodeRepository
            .createQueryBuilder('userCode')
            .leftJoinAndSelect('userCode.user', 'user')
            .select([
                'userCode.id',
                'userCode.code',
                'userCode.action',
                'userCode.expireAt',
                'user.id',
                'user.status',
                'user.password',
                'user.salt',
            ])
            .where('userCode.code = :code', { code })
            .andWhere('userCode.action = :action', { action })
            .getOne();
    }

    async countUserCodesBy(data: {
        user: UserEntity;
        attemptsRestriction: Date;
    }): Promise<number> {
        const result = await userCodeRepository
            .createQueryBuilder('userCode')
            .select('COUNT(userCode.id) as count')
            .where('"userCode"."userId" = :userId', { userId: data.user.id })
            .andWhere('"userCode"."expireAt" > :expireAt', {
                expireAt: data.attemptsRestriction,
            })
            .getRawOne();
        return +result.count;
    }

    findAccessToken(relatedTokenId: number): Promise<UserTokenEntity> {
        return userTokenRepository
            .createQueryBuilder('userToken')
            .where('"userToken"."relatedTokenId" = :relatedTokenId', {
                relatedTokenId,
            })
            .andWhere('"userToken".type = :type', {
                type: UserTokenType.ACCESS,
            })
            .getOne();
    }
}
