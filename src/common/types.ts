import { UserEntity, CityEntity } from '../db/entities';

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
