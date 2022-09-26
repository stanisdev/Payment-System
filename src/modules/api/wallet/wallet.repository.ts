import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Currency } from '../../../common/enums';
import { WalletData } from '../../../common/types/wallet.type';
import { UserEntity, WalletEntity } from '../../../db/entities';
import { walletRepository } from '../../../db/repositories';

@Injectable()
export class WalletServiceRepository {
    async create(
        { user, currencyId, identifier }: WalletData,
        transactionalEntityManager?: EntityManager,
    ): Promise<WalletEntity> {
        const wallet = new WalletEntity();
        wallet.balance = 0;
        wallet.identifier = identifier;
        wallet.currencyId = currencyId;
        wallet.user = user;

        if (transactionalEntityManager instanceof EntityManager) {
            await transactionalEntityManager.save(wallet);
        } else {
            await walletRepository.save(wallet);
        }
        return wallet;
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
