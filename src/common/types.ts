import { UserEntity, CityEntity } from '../db/entities';
import { UserTokenType } from './enums';

export type BasicUserData = {
    memberId: number;
    email: string;
    password: string;
    status: number;
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
};

export type TimeInterval = {
    unit: string;
    duration: number;
};

export type JwtExpiration = {
    access: TimeInterval;
    refresh: TimeInterval;
};

export type JwtSignOptions = {
    data: PlainHashMap;
    expiresIn: number;
};

export type PlainHashMap = {
    [key: string]: string | number;
};

export type SignInResponse = {
    type: string;
    token: string;
    expireAt: Date;
};

export type EmptyObject = {};
