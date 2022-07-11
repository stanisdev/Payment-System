import { Injectable } from '@nestjs/common';
import { WalletType } from '../../../common/enums';
import { BasicWalletData } from '../../../common/types/wallet.type';
import {
    UserEntity,
    WalletCategoryEntity,
    WalletEntity,
} from '../../../db/entities';
import {
    walletCategoryRepository,
    walletRepository,
} from '../../../db/repositories';
import { InsertResult } from 'typeorm';

@Injectable()
export class WalletServiceRepository {
    create(data: BasicWalletData): Promise<InsertResult> {
        return walletRepository
            .createQueryBuilder()
            .insert()
            .values({
                user: data.user,
                balance: 0,
                identifier: data.identifier,
                typeId: data.type,
            })
            .execute();
    }

    async count(user: UserEntity, walletType: WalletType): Promise<number> {
        const { count } = await walletRepository
            .createQueryBuilder('wallet')
            .select('COUNT(wallet.id) as count')
            .where('"userId" = :userId', { userId: user.id })
            .andWhere('"typeId" = :typeId', { typeId: walletType })
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
            .leftJoinAndSelect('wallet.type', 'type')
            .select(['wallet.identifier', 'wallet.balance', 'type.name'])
            .where('wallet."userId" = :userId', { userId: user.id })
            .orderBy('type.id')
            .limit(limit)
            .offset(offset)
            .getMany();
    }

    getCategories(
        limit: number,
        offset: number,
    ): Promise<WalletCategoryEntity[]> {
        return walletCategoryRepository
            .createQueryBuilder('category')
            .leftJoinAndSelect('category.types', 'type')
            .select(['category.id', 'category.name', 'type.id', 'type.name'])
            .orderBy('category.name', 'ASC')
            .limit(limit)
            .offset(offset)
            .getMany();
    }
}
