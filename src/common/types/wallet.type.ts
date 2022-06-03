import { UserEntity } from '../../db/entities';
import { WalletType } from '../enums';

export type BasicWalletData = {
    user: UserEntity;
    identifier: number;
    type: WalletType;
};

export type WalletsListResult = {
    identifier: number;
    balance: number;
    type: string;
};

export type FindWalletCriteria = {
    user?: UserEntity;
    typeId: number;
    identifier: number;
};

export type UpdateWalletBalanceData = {
    walletId: number;
    balance: number;
};

export type WalletCategory = {
    id: number;
    name: string;
    types: WalletTypeRecord[];
};

export type WalletTypeRecord = {
    id: number;
    name: string;
};
