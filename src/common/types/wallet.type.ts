import { UserEntity } from '../../db/entities';
import { Currency } from '../enums';

export type BasicWalletData = {
    user: UserEntity;
    identifier: number;
    currencyId: Currency;
};

export type WalletsListResult = {
    identifier: number;
    balance: number;
    currency: string;
};

export type FindWalletCriteria = {
    user?: UserEntity;
    typeId: number;
    identifier?: number;
};

export type UpdateWalletBalanceData = {
    walletId: number;
    balance: number;
};

export type WalletCategory = {
    id: number;
    name: string;
    currencies: CurrencyRecord[];
};

export type CurrencyRecord = {
    id: number;
    name: string;
};
