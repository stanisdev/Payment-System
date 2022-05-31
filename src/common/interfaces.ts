import * as nodemailer from 'nodemailer';

export interface MockTransporter {
    sendMail(): Promise<nodemailer.SentMessageInfo>;
}
