import { JwtSecretKey } from '../enums';
import { CacheTemplate } from '../providers/cache/templates';

export type RandomStringOptions = {
    onlyDigits?: boolean;
    length: number;
};

export type JwtSignOptions = {
    data: PlainRecord;
    expiresIn: number;
    secretKey: JwtSecretKey;
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

export type CacheModifyParams = {
    increase?: boolean;
    expiration?: number;
    data?: string;
};

export type CacheRecordOptions = {
    template: CacheTemplate;
    identifier: string;
};

export type EmptyObject = Record<string, never>;
export type PlainRecord = Record<string, string | number>;
