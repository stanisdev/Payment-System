import * as i18next from 'i18next';
import * as moment from 'moment';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TransferType } from '../../common/enums';
import { FindWalletCriteria } from '../../common/types/wallet.type';
import { Pagination } from '../../common/types/other.type';
import {
    InternalTransferResult,
    InvoiceResult,
    ReplenishmentResult,
    SearchInvoiceCriteria,
    TransferData,
    TransferRecord,
    TransferReport,
    WithdrawalResult,
} from '../../common/types/transfer.type';
import { appDataSource } from '../../db/dataSource';
import {
    ClientEntity,
    PayeeEntity,
    TransferEntity,
    UserEntity,
    WalletEntity,
} from '../../db/entities';
import { EntityManager } from 'typeorm';
import { InternalTransferDto } from './dto/internal.dto';
import { ReplenishmentDto } from './dto/replenishment.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferServiceRepository } from './transfer.repository';
import { RefundDto } from './dto/refund.dto';
import { InvoiceCreateDto } from './dto/invoice-create.dto';
import { InvoicePayDto } from './dto/invoice-pay.dto';

@Injectable()
export class TransferService {
    constructor(
        private readonly repository: TransferServiceRepository,
        private readonly configService: ConfigService,
    ) {}

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
     * Refund an amount of money if the transfer
     * was executed recently
     */
    async refund(
        { transferId, amount }: RefundDto,
        user: UserEntity,
    ): Promise<void> {
        const transfer = await this.repository.getTransfer({
            id: transferId,
            type: TransferType.INTERNAL,
            amount,
            user,
        });
        if (!(transfer instanceof TransferEntity)) {
            throw new BadRequestException(i18next.t('transfer-not-found'));
        }
        const refundPeriod = +this.configService.get('REFUND_ALLOWED_PERIOD');
        const transferExpiration = moment()
            .subtract(refundPeriod, 'hour')
            .toDate();

        if (transfer.createdAt <= transferExpiration) {
            throw new BadRequestException(
                i18next.t('unable-to-revoke-transfer', { hours: refundPeriod }),
            );
        }
        if (transfer.walletRecipient.balance < amount) {
            throw new BadRequestException(
                i18next.t('recipient-balance-is-not-enough'),
            );
        }
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const senderWalletData = {
                    walletId: transfer.walletSender.id,
                    balance: transfer.walletSender.balance + amount,
                };
                const recipientWalletData = {
                    walletId: transfer.walletRecipient.id,
                    balance: transfer.walletRecipient.balance - amount,
                };
                const transferData: TransferData = {
                    walletRecipientId: transfer.walletSender.id,
                    walletSenderId: transfer.walletRecipient.id,
                    amount,
                    type: TransferType.REFUND,
                    comment: i18next.t('cancel-of-transfer') + transfer.id,
                };
                /**
                 * Execute the transaction
                 */
                await this.repository.updateWalletBalance(
                    senderWalletData,
                    transactionalEntityManager,
                );
                await this.repository.updateWalletBalance(
                    recipientWalletData,
                    transactionalEntityManager,
                );
                await this.repository.createTransfer(
                    transferData,
                    transactionalEntityManager,
                );
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

    /**
     * Bill an amount to a user and await its repayment
     */
    async invoiceCreate(
        dto: InvoiceCreateDto,
        user: UserEntity,
        debtorWallet: WalletEntity,
    ): Promise<InvoiceResult> {
        const recipientWallet = await this.repository.getWallet({
            user,
            typeId: dto.walletType,
        });
        if (!(recipientWallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('no-wallet-to-bill'));
        }
        const invoiceData: SearchInvoiceCriteria = {
            walletSenderId: debtorWallet.id,
            walletRecipientId: recipientWallet.id,
            type: TransferType.INVOICE_CREATED,
        };
        const invoice = await this.repository.getInvoice(invoiceData);
        if (invoice instanceof TransferEntity) {
            throw new BadRequestException(i18next.t('invoice-already-exists'));
        }

        const transferData: TransferData = {
            ...invoiceData,
            amount: dto.amount,
        };
        const transferInfo = await this.repository.createTransfer(transferData);
        return {
            id: transferInfo.id,
            debtorWallet: debtorWallet.getFullIdentifier(),
            recipientWallet: recipientWallet.getFullIdentifier(),
            amount: dto.amount,
        };
    }

    /**
     * Pay an invoice with the given id
     */
    async invoicePay(
        dto: InvoicePayDto,
        user: UserEntity,
    ): Promise<InvoiceResult> {
        const transfer = await this.repository.getTransfer({
            id: dto.transferId,
            type: TransferType.INVOICE_CREATED,
            includeWalletsType: true,
            user,
        });
        if (!(transfer instanceof TransferEntity)) {
            throw new BadRequestException(i18next.t('invoice-not-found'));
        }
        if (transfer.amount > transfer.walletSender.balance) {
            throw new BadRequestException(i18next.t('no-money-to-pay-invoice'));
        }
        const { walletSender, walletRecipient } = transfer;
        /**
         * Fulfill the primary transaction
         */
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const updateSenderData = {
                    walletId: walletSender.id,
                    balance: walletSender.balance - transfer.amount,
                };
                const updateRecipientData = {
                    walletId: walletRecipient.id,
                    balance: walletRecipient.balance + transfer.amount,
                };
                await Promise.all([
                    this.repository.updateWalletBalance(
                        updateSenderData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateWalletBalance(
                        updateRecipientData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateTransfer(
                        transfer.id,
                        { type: TransferType.INVOICE_PAID },
                        transactionalEntityManager,
                    ),
                ]);
            },
        );
        return {
            id: transfer.id,
            debtorWallet: walletSender.getFullIdentifier(),
            recipientWallet: walletRecipient.getFullIdentifier(),
            amount: transfer.amount,
        };
    }
}
