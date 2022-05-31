import { UserEntity, WalletEntity, PayeeEntity } from '../../db/entities';

export type BasicPayeeData = {
    user: UserEntity;
    wallet: WalletEntity;
    name: string;
    email?: string;
    phone?: string;
};

export type Payee = {
    id: string;
    wallet: string;
    name: string;
    email: string;
    phone: string;
};

export type UpdatePayeeData = {
    wallet: WalletEntity;
    payee: PayeeEntity;
    user: UserEntity;
};
