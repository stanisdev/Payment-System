import * as i18next from 'i18next';
import * as moment from 'moment';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MathOperator, TransferType } from '../../../common/enums';
import { Pagination } from '../../../common/types/other.type';
import {
    InternalTransferResult,
    InvoiceResult,
    ReplenishmentResult,
    SearchInvoiceCriteria,
    TransferData,
    TransferRecord,
    TransferReport,
    WithdrawalResult,
} from '../../../common/types/transfer.type';
import { appDataSource } from '../../../db/dataSource';
import {
    ClientEntity,
    PayeeEntity,
    TransferEntity,
    UserEntity,
    WalletEntity,
} from '../../../db/entities';
import { EntityManager } from 'typeorm';
import { InternalTransferDto } from './dto/internal.dto';
import { ReplenishmentDto } from './dto/replenishment.dto';
import { WithdrawalDto } from './dto/withdrawal.dto';
import { TransferServiceRepository } from './transfer.repository';
import { RefundDto } from './dto/refund.dto';
import { InvoiceCreateDto } from './dto/invoice-create.dto';
import { FeeProvider } from 'src/common/providers/fee/index';
import { TransferUtility } from './transfer.utility';
import {
    FeeBasicParams,
    FeeRefundParams,
} from '../../../common/providers/fee/types';

@Injectable()
export class TransferService {
    constructor(
        private readonly repository: TransferServiceRepository,
        private readonly configService: ConfigService,
        private readonly utility: TransferUtility,
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
        const senderWallet = await this.utility.getWallet({
            user,
            currencyId: dto.currencyId,
            identifier: dto.walletIdentifier,
        });
        const recipientWallet = payee.wallet;
        if (recipientWallet.currencyId !== senderWallet.currencyId) {
            throw new BadRequestException(i18next.t('wrong-currency'));
        }
        if (senderWallet.balance < dto.amount) {
            throw new BadRequestException(i18next.t('no-enough-money'));
        }
        /**
         * Determine whether a fee has to be charged
         */
        const feeParams: FeeBasicParams = {
            transfer: {
                amount: dto.amount,
                type: TransferType.INTERNAL,
            },
        };
        const fee = new FeeProvider(feeParams);
        await fee.calculate();
        /**
         * Exectue a transaction implementing the task
         */
        let transferInfo: TransferRecord;
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
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const tasks: Promise<void>[] = [];
                if (fee.isAvailable()) {
                    updateSenderData.balance -= fee.value;

                    const updateSystemIncomeParams = {
                        amount: fee.value,
                        operator: MathOperator.INCREASE,
                        currencyId: senderWallet.currencyId,
                    };
                    tasks.push(
                        this.repository.updateSystemIncome(
                            updateSystemIncomeParams,
                            transactionalEntityManager,
                        ),
                    );
                }
                tasks.push(
                    this.repository.updateWalletBalance(
                        updateSenderData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateWalletBalance(
                        updateRecipientData,
                        transactionalEntityManager,
                    ),
                );
                await Promise.all(tasks);
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
        const wallet = await this.utility.getWallet({
            user,
            currencyId: dto.currencyId,
            identifier: dto.walletIdentifier,
        });
        if (wallet.balance < dto.amount) {
            throw new BadRequestException(i18next.t('no-enough-money'));
        }
        let transferInfo: TransferRecord;
        const updateWalletData = {
            walletId: wallet.id,
            balance: wallet.balance - dto.amount,
        };
        const transferData = {
            walletSenderId: wallet.id,
            amount: dto.amount,
            type: TransferType.WITHDRAWAL,
            comment: i18next.t('withdrawal-direction') + dto.direction,
        };
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const [createdTransfer] = await Promise.all([
                    await this.repository.createTransfer(
                        transferData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateWalletBalance(
                        updateWalletData,
                        transactionalEntityManager,
                    ),
                ]);
                transferInfo = createdTransfer;
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
        const wallet = await this.utility.getWallet({
            currencyId: dto.currencyId,
            identifier: dto.walletIdentifier,
        });
        let transferInfo: TransferRecord;
        const updateWalletData = {
            walletId: wallet.id,
            balance: wallet.balance + dto.amount,
        };
        const transferData = {
            walletRecipientId: wallet.id,
            amount: dto.amount,
            type: TransferType.REPLENISHMENT,
            comment: client.name,
        };
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const [createdTransfer] = await Promise.all([
                    this.repository.createTransfer(
                        transferData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateWalletBalance(
                        updateWalletData,
                        transactionalEntityManager,
                    ),
                ]);
                transferInfo = createdTransfer;
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
        userSender: UserEntity,
    ): Promise<void> {
        const transfer = await this.repository.getTransfer({
            id: transferId,
            type: TransferType.INTERNAL,
            amount,
            user: userSender,
        });
        if (!(transfer instanceof TransferEntity)) {
            throw new BadRequestException(i18next.t('transfer-not-found'));
        }
        /**
         * Check whether the transfer can be reverted
         */
        const refundPeriod = +this.configService.getOrThrow(
            'restrictions.refund-allowed-period',
        );
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
        /**
         * Get the fee value of the initial transfer
         */
        const feeParams: FeeBasicParams = {
            transfer: {
                amount,
                type: TransferType.INTERNAL,
            },
        };
        const internalTransferFee = new FeeProvider(feeParams);
        await internalTransferFee.calculate();

        let refundFee: FeeProvider;
        if (internalTransferFee.isAvailable()) {
            /**
             * Calculate the fee of refund
             */
            const feeParams: FeeRefundParams = {
                transfer: {
                    amount,
                    type: TransferType.REFUND,
                },
                systemIncome: internalTransferFee.value,
            };
            refundFee = new FeeProvider(feeParams);
            await refundFee.calculate();
        }
        /**
         * Prepare the data for making changes
         */
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
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const tasks: Promise<void>[] = [
                    this.repository.updateWalletBalance(
                        recipientWalletData,
                        transactionalEntityManager,
                    ),
                ];
                if (
                    refundFee instanceof FeeProvider &&
                    refundFee.isAvailable()
                ) {
                    const systemIncomeSubtraction =
                        internalTransferFee.value - refundFee.value;

                    senderWalletData.balance += systemIncomeSubtraction;
                    const updateSystemIncomeParams = {
                        amount: systemIncomeSubtraction,
                        operator: MathOperator.DECREASE,
                        currencyId: transfer.walletSender.currencyId,
                    };
                    tasks.push(
                        this.repository.updateSystemIncome(
                            updateSystemIncomeParams,
                            transactionalEntityManager,
                        ),
                    );
                }
                tasks.push(
                    this.repository.updateWalletBalance(
                        senderWalletData,
                        transactionalEntityManager,
                    ),
                );
                await Promise.all(tasks);
                await this.repository.createTransfer(
                    transferData,
                    transactionalEntityManager,
                );
            },
        );
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
            currencyId: dto.currencyId,
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
        transferId: string,
        user: UserEntity,
    ): Promise<InvoiceResult> {
        const transfer = await this.repository.getTransfer({
            id: transferId,
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
        /**
         * Determine the necessity of implementing the fee
         */
        const feeParams: FeeBasicParams = {
            transfer: {
                amount: transfer.amount,
                type: TransferType.INVOICE_PAID,
            },
        };
        const fee = new FeeProvider(feeParams);
        await fee.calculate();

        const { walletSender, walletRecipient } = transfer;
        const updateSenderData = {
            walletId: walletSender.id,
            balance: walletSender.balance - transfer.amount,
        };
        const updateRecipientData = {
            walletId: walletRecipient.id,
            balance: walletRecipient.balance + transfer.amount,
        };
        /**
         * Fulfill the primary transaction
         */
        await appDataSource.transaction(
            async (transactionalEntityManager: EntityManager) => {
                const tasks: Promise<void>[] = [
                    this.repository.updateWalletBalance(
                        updateRecipientData,
                        transactionalEntityManager,
                    ),
                    this.repository.updateTransfer(
                        transfer.id,
                        { type: TransferType.INVOICE_PAID },
                        transactionalEntityManager,
                    ),
                ];
                /**
                 * Implement fee charging if the fee is intended
                 */
                if (fee.isAvailable()) {
                    updateSenderData.balance -= fee.value;
                    const updateSystemIncomeParams = {
                        amount: fee.value,
                        operator: MathOperator.INCREASE,
                        currencyId: transfer.walletSender.currency.id,
                    };
                    tasks.push(
                        this.repository.updateSystemIncome(
                            updateSystemIncomeParams,
                            transactionalEntityManager,
                        ),
                    );
                }
                tasks.push(
                    this.repository.updateWalletBalance(
                        updateSenderData,
                        transactionalEntityManager,
                    ),
                );
                await Promise.all(tasks);
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
