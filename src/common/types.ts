import {
    UserEntity,
    CityEntity,
    UserTokenEntity,
    WalletEntity,
} from '../db/entities';
import { LoggerTemplate, UserAction, UserTokenType, WalletType } from './enums';

export type BasicUserData = {
    memberId: number;
    email: string;
    password: string;
    status: number;
};

export type BasicWalletData = {
    user: UserEntity;
    identifier: number;
    type: WalletType;
};

export type UserInfoData = {
    user: UserEntity;
    city: CityEntity;
    accountName: string;
    fullName: string;
    country: string;
    address: string;
    zipCode: number;
    phone: string;
    accountType: string;
};

export type RandomStringOptions = {
    onlyDigits?: boolean;
    length: number;
};

export type UserTokenData = {
    user: UserEntity;
    type: UserTokenType;
    code: string;
    expireAt: Date;
    relatedTokenId?: number;
};

export type UserActivityData = {
    user: UserEntity;
    action: UserAction;
    template: LoggerTemplate;
    metadata?: string;
};

export type JwtSignOptions = {
    data: PlainHashMap;
    expiresIn: number;
};

export type JwtValidateOptions = {
    token: UserTokenEntity;
    type: UserTokenType;
    data: PlainHashMap;
};

export type PlainHashMap = {
    [key: string]: string | number;
};

export type JwtCompleteData = {
    type: string;
    token: string;
    expireAt: Date;
};

export type EmptyObject = {};

export type UserLogData = {
    user: UserEntity;
    action: UserAction;
    details: string;
};

export type UserInfoResponse = {
    id: number;
    memberId: number;
    email: string;
    status: number;
    createdAt: Date;
};

export type WalletsListResult = {
    identifier: number;
    type: string;
};

export type Pagination = {
    limit: number;
    page: number;
};

export type BasicUserCodeData = {
    user: UserEntity;
    code: string;
    action: UserAction;
    expireAt: Date;
};

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
