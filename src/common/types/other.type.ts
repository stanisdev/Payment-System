import { UserTokenEntity } from '../../db/entities';
import { UserTokenType } from '../enums';

export type RandomStringOptions = {
    onlyDigits?: boolean;
    length: number;
};

export type JwtSignOptions = {
    data: PlainRecord;
    expiresIn: number;
};

export type JwtValidateOptions = {
    token: UserTokenEntity;
    type: UserTokenType;
    data: PlainRecord;
};

export type JwtCompleteData = {
    type: string;
    token: string;
    expireAt: Date;
};

export type Pagination = {
    limit: number;
    offset: number;
};

export type EmptyObject = Record<string, never>;
export type PlainRecord = Record<string, string | number>;
