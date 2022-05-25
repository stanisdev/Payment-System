import { BadRequestException, Injectable } from '@nestjs/common';
import * as i18next from 'i18next';
import { TransferType } from 'src/common/enums';
import {
    FindWalletCriteria,
    InternalTransferResult,
    Pagination,
    ReplenishmentResult,
    TransferRecord,
    TransferReport,
    WithdrawalResult,
} from 'src/common/types';
import { appDataSource } from 'src/db/dataSource';
import {
    ClientEntity,
    PayeeEntity,
    UserEntity,
    WalletEntity,
} from 'src/db/entities';
import { EntityManager } from 'typeorm';
import { InternalTransferDto } from './dto/internal.dto';
import { ReplenishmentDto } from './dto/replenishment.dto';
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
        const senderWallet = await this.getWallet({
            user,
            typeId: dto.walletType,
            identifier: dto.walletIdentifier,
        });
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
        const wallet = await this.getWallet({
            user,
            typeId: dto.walletType,
            identifier: dto.walletIdentifier,
        });
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

    /**
     * Replenish the balance through a client
     * (external source)
     */
    async replenishment(
        dto: ReplenishmentDto,
        client: ClientEntity,
    ): Promise<ReplenishmentResult> {
        const wallet = await this.getWallet({
            typeId: dto.walletType,
            identifier: dto.walletIdentifier,
        });
        let transferInfo: TransferRecord;
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const updateWalletData = {
                    walletId: wallet.id,
                    balance: wallet.balance + dto.amount,
                };
                await this.repository.updateWalletBalance(
                    updateWalletData,
                    transactionalEntityManager,
                );
                const transferData = {
                    walletRecipientId: wallet.id,
                    amount: dto.amount,
                    type: TransferType.REPLENISHMENT,
                    comment: client.name,
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
            },
        };
    }

    /**
     * Get the list of transfers that relate to
     * user wallets
     */
    async list(
        pagination: Pagination,
        user: UserEntity,
    ): Promise<TransferReport[]> {
        const { limit, offset } = pagination;
        const transfers = await this.repository.getList(limit, offset, user);

        return transfers.map(
            ({
                id,
                amount,
                comment,
                createdAt,
                walletSender: walletSenderRecord,
                walletRecipient: walletRecipientRecord,
            }) => {
                let walletSender: string | null = null;
                let walletRecipient: string | null = null;

                if (walletSenderRecord instanceof WalletEntity) {
                    walletSender = walletSenderRecord.getFullIdentifier();
                }
                if (walletRecipientRecord instanceof WalletEntity) {
                    walletRecipient = walletRecipientRecord.getFullIdentifier();
                }
                return {
                    id,
                    walletSender,
                    walletRecipient,
                    amount,
                    comment,
                    createdAt,
                };
            },
        );
    }

    /**
     * Find and get a wallet by the given search criteria
     */
    private async getWallet(
        data: FindWalletCriteria,
    ): Promise<WalletEntity | never> {
        const wallet = await this.repository.getWallet(data);
        if (!(wallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('wallet-not-found'));
        }
        return wallet;
    }
}
