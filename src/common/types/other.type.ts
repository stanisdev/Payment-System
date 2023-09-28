import { CacheTemplate } from '../providers/cache/templates';

export type RandomStringOptions = {
    onlyDigits?: boolean;
    length: number;
};

export type JwtSignParams = {
    data: PlainRecord;
    expiresIn: number;
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
    data?: PlainRecord;
};

export type EmptyObject = Record<string, never>;
export type PlainRecord = Record<string, string | number | Date>;
export type RedisHash = Record<string, string>;
