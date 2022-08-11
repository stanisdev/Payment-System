import { UserEntity } from '../../db/entities';
import { MathOperator, TransferType } from '../enums';

export type InternalTransferResult = {
    id: string;
    walletSender: string;
    walletRecipient: string;
    payeeName: string;
    amount: number;
    comment?: string;
    createdAt: Date;
};

export type TransferData = {
    walletSenderId?: number;
    walletRecipientId?: number;
    amount: number;
    type: TransferType;
    comment?: string;
};

export type TransferRecord = {
    id: string;
    createdAt: Date;
};

export type TransferReport = {
    id: string;
    walletSender: string | null;
    walletRecipient: string | null;
    amount: number;
    comment: string;
    createdAt: Date;
};

export type WithdrawalResult = {
    id: string;
    wallet: string;
    amount: number;
    direction: string;
    comment?: string;
    createdAt: Date;
};

export type ReplenishmentResult = {
    id: string;
    wallet: string;
    amount: number;
    createdAt: Date;
};

export type SearchTransferCriteria = {
    id: string;
    type: TransferType;
    user: UserEntity;
    amount?: number;
    includeWalletsType?: boolean;
};

export type InvoiceResult = {
    id: string;
    debtorWallet: string;
    recipientWallet: string;
    amount: number;
};

export type SearchInvoiceCriteria = {
    walletSenderId: number;
    walletRecipientId: number;
    type: TransferType;
};

export type UpdateTransferData = {
    type: TransferType;
};

export type UpdateSystemIncomeParams = {
    amount: number;
    operator: MathOperator;
    currencyId: number;
};
