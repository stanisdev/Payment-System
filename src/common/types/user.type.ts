import { UserEntity, CityEntity } from '../../db/entities';
import {
    LoggerTemplate,
    UserAction,
    UserStatus,
    UserTokenType,
} from '../enums';

export type FullUserInfo = {
    memberId: number;
    email: string;
    password: string;
    status: UserStatus;
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

export type UserLogData = {
    user: UserEntity;
    action: UserAction;
    details: string;
};

export type UserCodeData = {
    user: UserEntity;
    code: string;
    action: UserAction;
    expireAt: Date;
};
