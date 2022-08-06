import { Injectable } from '@nestjs/common';
import { EntityManager, InsertQueryBuilder } from 'typeorm';
import {
    SearchInvoiceCriteria,
    SearchTransferCriteria,
    TransferData,
    TransferRecord,
    UpdateTransferData,
} from '../../../common/types/transfer.type';
import {
    FindWalletCriteria,
    UpdateWalletBalanceData,
} from '../../../common/types/wallet.type';
import { TransferEntity, UserEntity, WalletEntity } from '../../../db/entities';
import { transferRepository, walletRepository } from '../../../db/repositories';

@Injectable()
export class TransferServiceRepository {
    getWallet({
        user,
        currencyId,
        identifier,
    }: FindWalletCriteria): Promise<WalletEntity> {
        const query = walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.currency', 'currency')
            .where('wallet."currencyId" = :currencyId', { currencyId });
        if (user instanceof UserEntity) {
            query.andWhere('wallet.userId = :userId', { userId: user.id });
        }
        if (Number.isInteger(identifier)) {
            query.andWhere('wallet.identifier = :identifier', { identifier });
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
        transactionalEntityManager?: EntityManager,
    ): Promise<TransferRecord> {
        let qb: InsertQueryBuilder<TransferEntity>;

        if (!transactionalEntityManager) {
            qb = transferRepository.createQueryBuilder().insert().values(data);
        } else {
            qb = transactionalEntityManager
                .createQueryBuilder()
                .insert()
                .into(TransferEntity)
                .values(data);
        }
        const insertedData = await qb.execute();
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
        includeWalletsType,
    }: SearchTransferCriteria): Promise<TransferEntity> {
        const select = [
            'transfer.id',
            'transfer.createdAt',
            'transfer.amount',
            'walletSender.id',
            'walletSender.balance',
            'walletRecipient.id',
            'walletRecipient.balance',
        ];
        const qb = transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.walletSender', 'walletSender')
            .leftJoinAndSelect('transfer.walletRecipient', 'walletRecipient')
            .where('transfer.id = :id', { id })
            .andWhere('transfer.type = :type', { type })
            .andWhere('walletSender.userId = :userId', { userId: user.id });

        if (includeWalletsType) {
            qb.leftJoinAndSelect(
                'walletSender.type',
                'walletSenderType',
            ).leftJoinAndSelect('walletRecipient.type', 'walletRecipientType');
            select.push(
                'walletSender.identifier',
                'walletSenderType.name',
                'walletRecipient.identifier',
                'walletRecipientType.name',
            );
        }
        if (Number.isInteger(amount)) {
            qb.andWhere('transfer.amount = :amount', { amount });
        }
        return qb.select(select).getOne();
    }

    getInvoice(data: SearchInvoiceCriteria): Promise<TransferEntity> {
        return transferRepository
            .createQueryBuilder('transfer')
            .where('transfer.walletSenderId = :walletSenderId')
            .andWhere('transfer.walletRecipientId = :walletRecipientId')
            .andWhere('transfer.type = :type')
            .setParameters(data)
            .getOne();
    }

    async updateTransfer(
        id: string,
        data: UpdateTransferData,
        transactionalEntityManager: EntityManager,
    ): Promise<void> {
        await transactionalEntityManager
            .createQueryBuilder()
            .update(TransferEntity)
            .set(data)
            .where('id = :id', { id })
            .execute();
    }
}
