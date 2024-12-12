import { Injectable } from '@nestjs/common';
import { ObjectLiteral } from 'typeorm';
import {
    UserCodeEntity,
    UserEntity,
    UserTokenEntity,
} from '../../../../db/entities';
import { UserCodeData } from '../../../../common/types/user.type';
import {
    userCodeRepository,
    userRepository,
    userTokenRepository,
} from '../../../../db/repositories';
import { UserAction, UserTokenType } from '../../../../common/enums';

@Injectable()
export class AuthServiceRepository {
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
    }: UserCodeData): Promise<void> {
        await userCodeRepository
            .createQueryBuilder()
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

    findUserByParams(
        searchCriteria: ObjectLiteral,
        selection: string[],
    ): Promise<UserEntity> {
        return userRepository
            .createQueryBuilder('user')
            .where(searchCriteria)
            .select(selection)
            .getOne();
    }
}
