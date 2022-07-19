import { AdminEntity } from '../../db/entities';

export type AdminData = {
    status: number;
};

export type AdminTokenData = {
    admin: AdminEntity;
    serverCode: string;
    clientCode: string;
    expireAt: Date;
};

export type AuthResponse = {
    jwt: {
        token: string;
        expireAt: Date;
    };
    client: {
        code: string;
    };
};
