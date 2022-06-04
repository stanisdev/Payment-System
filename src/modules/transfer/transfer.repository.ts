import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
    SearchTransferCriteria,
    TransferData,
    TransferRecord,
} from '../../common/types/transfer.type';
import {
    FindWalletCriteria,
    UpdateWalletBalanceData,
} from '../../common/types/wallet.type';
import { TransferEntity, UserEntity, WalletEntity } from '../../db/entities';
import { transferRepository, walletRepository } from '../../db/repositories';

@Injectable()
export class TransferServiceRepository {
    getWallet({
        user,
        typeId,
        identifier,
    }: FindWalletCriteria): Promise<WalletEntity> {
        const query = walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .where('wallet."typeId" = :typeId', { typeId })
            .andWhere('wallet.identifier = :identifier', { identifier });
        if (user instanceof UserEntity) {
            query.andWhere('wallet.userId = :userId', { userId: user.id });
        }
        return query.getOne();
    }

    async updateWalletBalance(
        { walletId, balance }: UpdateWalletBalanceData,
        transactionalEntityManager: EntityManager,
    ): Promise<void> {
        await transactionalEntityManager
            .createQueryBuilder()
            .update(WalletEntity)
            .set({ balance })
            .where('id = :id', { id: walletId })
            .execute();
    }

    async createTransfer(
        data: TransferData,
        transactionalEntityManager: EntityManager,
    ): Promise<TransferRecord> {
        const insertedData = await transactionalEntityManager
            .createQueryBuilder()
            .insert()
            .into(TransferEntity)
            .values(data)
            .execute();
        return insertedData.raw[0];
    }

    getList(
        limit: number,
        offset: number,
        user: UserEntity,
    ): Promise<TransferEntity[]> {
        return transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.walletSender', 'walletSender')
            .leftJoinAndSelect('transfer.walletRecipient', 'walletRecipient')
            .leftJoinAndSelect('walletSender.type', 'walletSenderType')
            .leftJoinAndSelect('walletRecipient.type', 'walletRecipientType')
            .select([
                'transfer.id',
                'transfer.amount',
                'transfer.comment',
                'transfer."createdAt"',
                'walletSender.identifier',
                'walletRecipient.identifier',
                'walletSenderType.name',
                'walletRecipientType.name',
            ])
            .where('"walletSender"."userId" = :userId', { userId: user.id })
            .orWhere('"walletRecipient"."userId" = :userId', {
                userId: user.id,
            })
            .limit(limit)
            .offset(offset)
            .orderBy('transfer.createdAt', 'DESC')
            .getMany();
    }

    getTransfer({
        id,
        type,
        amount,
        user,
    }: SearchTransferCriteria): Promise<TransferEntity> {
        return transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.walletSender', 'walletSender')
            .leftJoinAndSelect('transfer.walletRecipient', 'walletRecipient')
            .where('transfer.id = :id', { id })
            .andWhere('transfer.amount = :amount', { amount })
            .andWhere('transfer.type = :type', { type })
            .andWhere('walletSender.userId = :userId', { userId: user.id })
            .getOne();
    }
}
