import { InsertResult } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Currency } from '../../../common/enums';
import { BasicWalletData } from '../../../common/types/wallet.type';
import { UserEntity, WalletEntity } from '../../../db/entities';
import { walletRepository } from '../../../db/repositories';

@Injectable()
export class WalletServiceRepository {
    create(data: BasicWalletData): Promise<InsertResult> {
        return walletRepository
            .createQueryBuilder()
            .insert()
            .values({
                ...data,
                balance: 0,
            })
            .execute();
    }

    async count(user: UserEntity, currencyId: Currency): Promise<number> {
        const { count } = await walletRepository
            .createQueryBuilder('wallet')
            .select('COUNT(wallet.id) as count')
            .where('"userId" = :userId', { userId: user.id })
            .andWhere('"currencyId" = :currencyId', { currencyId })
            .getRawOne();
        return +count;
    }

    getList(
        user: UserEntity,
        limit: number,
        offset: number,
    ): Promise<WalletEntity[]> {
        return walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.currency', 'currency')
            .select(['wallet.identifier', 'wallet.balance', 'currency.name'])
            .where('wallet."userId" = :userId', { userId: user.id })
            .orderBy('currency.id')
            .limit(limit)
            .offset(offset)
            .getMany();
    }
}
