import * as nodemailer from 'nodemailer';
import { PlainRecord } from './types/other.type';

export interface MockTransporter {
    sendMail(): Promise<nodemailer.SentMessageInfo>;
}

export interface AuthStrategy<T> {
    readonly secretKey: string;

    checkAdmission(tokenInstance: T): void | never;

    validateDecryptedData(decryptedData: PlainRecord): void | never;

    getTokenInstance(searchCriteria: PlainRecord): Promise<T>;
}

export interface FeeHandler {
    calculate(): Promise<number>;
}
