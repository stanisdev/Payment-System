import { BadRequestException, Injectable } from '@nestjs/common';
import * as i18next from 'i18next';
import { TransferType } from 'src/common/enums';
import { InternalTransferResult, TransferRecord } from 'src/common/types';
import { appDataSource } from 'src/db/dataSource';
import { PayeeEntity, UserEntity, WalletEntity } from 'src/db/entities';
import { EntityManager } from 'typeorm';
import { InternalTransferDto } from './dto/internal.dto';
import { TransferServiceRepository } from './transfer.repository';

@Injectable()
export class TransferService {
    constructor(private readonly repository: TransferServiceRepository) {}

    /**
     * Transfer money from a wallet to a wallet
     * (within the system)
     */
    async internal(
        dto: InternalTransferDto,
        user: UserEntity,
        payee: PayeeEntity,
    ): Promise<InternalTransferResult> {
        const senderWallet = await this.repository.getWallet({
            user,
            typeId: dto.walletType,
            identifier: dto.walletIdentifier,
        });
        if (!(senderWallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('wallet-not-found'));
        }
        const recipientWallet = payee.wallet;
        if (recipientWallet.typeId !== senderWallet.typeId) {
            throw new BadRequestException(i18next.t('incorrect-wallets-type'));
        }
        if (senderWallet.balance < dto.amount) {
            throw new BadRequestException(i18next.t('no-enough-money'));
        }
        /**
         * Exectue a transction implementing the task
         */
        let totalTransferInfo: TransferRecord;
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const updateSenderData = {
                    walletId: senderWallet.id,
                    balance: senderWallet.balance - dto.amount,
                };
                const updateRecipientData = {
                    walletId: recipientWallet.id,
                    balance: recipientWallet.balance + dto.amount,
                };
                const transferData = {
                    walletSenderId: senderWallet.id,
                    walletRecipientId: recipientWallet.id,
                    amount: dto.amount,
                    type: TransferType.INTERNAL,
                    comment: dto.comment,
                };
                await this.repository.updateWalletBalance(
                    updateSenderData,
                    transactionalEntityManager,
                );
                await this.repository.updateWalletBalance(
                    updateRecipientData,
                    transactionalEntityManager,
                );
                const insertedTransferData =
                    await this.repository.createTransfer(
                        transferData,
                        transactionalEntityManager,
                    );
                totalTransferInfo = insertedTransferData.raw[0];
            },
        );
        return {
            id: totalTransferInfo.id,
            walletSender: senderWallet.getFullIdentifier(),
            walletRecipient: recipientWallet.getFullIdentifier(),
            payeeName: payee.name,
            amount: dto.amount,
            comment: dto.comment,
            createdAt: totalTransferInfo.createdAt,
        };
    }
}
