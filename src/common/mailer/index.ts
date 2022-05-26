import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { join } from 'path';
import { Injectable } from '@nestjs/common';
import { MailerTemplate } from '../enums';

@Injectable()
export class Mailer {
    private host: string;
    private port: number;
    private user: string;
    private password: string;
    private from: string;
    private templatesPath: string;
    private transporter: nodemailer.Transporter;

    constructor() {
        const { env } = process;
        this.host = env.MAILER_HOST;
        this.port = +env.MAILER_PORT;
        this.user = env.MAILER_USER;
        this.password = env.MAILER_PASSWORD;
        this.from = `${env.MAILER_INTRODUCTION}: <${env.MAILER_FROM}>`;
        this.templatesPath = join(__dirname, 'templates');
    }
    /**
     * Create the transporter for the mail delivery
     */
    setTransporter() {
        this.transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: false,
            auth: {
                user: this.user,
                pass: this.password,
            },
        });
    }
    /**
     * Send an email with the given parameters
     */
    async sendMail({
        to,
        subject,
        template,
        data,
    }: {
        to: string;
        subject: string;
        template: MailerTemplate;
        data?: any;
    }): Promise<nodemailer.SentMessageInfo> {
        const templatePath = join(this.templatesPath, template + '.pug');
        const compiledFunction = pug.compileFile(templatePath);
        const content = compiledFunction(data);

        return this.transporter.sendMail({
            from: this.from,
            to,
            subject,
            text: content,
            html: content,
        });
    }
}
