import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { join } from 'path';
import { MailerTemplate } from '../../enums';
import { MockTransporter } from '../../interfaces';

/**
 * @todo: Remove this class
 */
export class Mailer {
    private static transporter: nodemailer.Transporter | MockTransporter;
    private static templatesPath: string;
    private static from: string;

    /**
     * Create the transporter for the mail delivery
     */
    static setTransporter() {
        const { env } = process;
        Mailer.from = `${env.MAILER_INTRODUCTION}: <${env.MAILER_FROM}>`;
        Mailer.templatesPath = join(__dirname, 'templates');

        let transporter: nodemailer.Transporter | MockTransporter;
        if (env.NODE_ENV == 'test') {
            transporter = {
                async sendMail() {},
            };
        } else {
            transporter = nodemailer.createTransport({
                host: env.MAILER_HOST,
                port: +env.MAILER_PORT,
                secure: false,
                auth: {
                    user: env.MAILER_USER,
                    pass: env.MAILER_PASSWORD,
                },
            });
        }
        Mailer.transporter = transporter;
    }

    /**
     * Send an email with the given parameters
     */
    static async sendMail({
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
        const templatePath = join(Mailer.templatesPath, template + '.pug');
        const compiledFunction = pug.compileFile(templatePath);
        const content = compiledFunction(data);

        return Mailer.transporter.sendMail({
            from: Mailer.from,
            to,
            subject,
            text: content,
            html: content,
        });
    }
}
