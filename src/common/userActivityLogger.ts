import { userLogRepository } from 'src/db/repositories';
import { LoggerTemplate } from './enums';
import { UserActivityData } from './types';

export class UserActivityLogger {
    static async write({
        user,
        action,
        template,
        metadata,
    }: UserActivityData): Promise<void> {
        let details = '';
        if (template != LoggerTemplate.PLAIN) {
            details = template;
        }
        if (typeof metadata == 'string') {
            details += metadata;
        }
        await userLogRepository
            .createQueryBuilder()
            .insert()
            .values({
                user,
                action,
                details,
            })
            .execute();
    }
}
