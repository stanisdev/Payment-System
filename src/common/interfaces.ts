import * as nodemailer from 'nodemailer';
import { PlainRecord } from './types/other.type';

export interface MockTransporter {
    sendMail(): Promise<nodemailer.SentMessageInfo>;
}

export interface AuthStrategy<T> {
    readonly secretKey: string;

    validate(tokenInstance: T): void | never;

    getTokenInstance(searchCriteria: PlainRecord): Promise<T>;
}
