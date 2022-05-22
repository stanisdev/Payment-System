import { BadRequestException, Injectable } from '@nestjs/common';
import * as i18next from 'i18next';
import { TransferType } from 'src/common/enums';
import {
    InternalTransferResult,
    TransferRecord,
    WithdrawalResult,
} from 'src/common/types';
import { appDataSource } from 'src/db/dataSource';
import { PayeeEntity, UserEntity, WalletEntity } from 'src/db/entities';
import { EntityManager } from 'typeorm';
import { InternalTransferDto } from './dto/internal.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
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
        let transferInfo: TransferRecord;
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
                transferInfo = await this.repository.createTransfer(
                    transferData,
                    transactionalEntityManager,
                );
            },
        );
        return {
            ...transferInfo,
            ...{
                walletSender: senderWallet.getFullIdentifier(),
                walletRecipient: recipientWallet.getFullIdentifier(),
                payeeName: payee.name,
                amount: dto.amount,
                comment: dto.comment,
            },
        };
    }

    /**
     * Withdraw a certain amount of money from a wallet
     * in a direction
     */
    async withdrawal(
        dto: WithdrawalDto,
        user: UserEntity,
    ): Promise<WithdrawalResult> {
        const wallet = await this.repository.getWallet({
            user,
            typeId: dto.walletType,
            identifier: dto.walletIdentifier,
        });
        if (!(wallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('wallet-not-found'));
        }
        if (wallet.balance < dto.amount) {
            throw new BadRequestException(i18next.t('no-enough-money'));
        }
        let transferInfo: TransferRecord;
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const updateWalletData = {
                    walletId: wallet.id,
                    balance: wallet.balance - dto.amount,
                };
                await this.repository.updateWalletBalance(
                    updateWalletData,
                    transactionalEntityManager,
                );
                const transferData = {
                    walletSenderId: wallet.id,
                    amount: dto.amount,
                    type: TransferType.WITHDRAWAL,
                    comment: i18next.t('withdrawal-direction') + dto.direction,
                };
                transferInfo = await this.repository.createTransfer(
                    transferData,
                    transactionalEntityManager,
                );
            },
        );
        return {
            ...transferInfo,
            ...{
                wallet: wallet.getFullIdentifier(),
                amount: dto.amount,
                direction: dto.direction,
            },
        };
    }
}
