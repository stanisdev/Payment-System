import { UserLogData } from 'src/common/types';
import { appDataSource } from '../dataSource';
import { UserLogEntity } from '../entities';

export const userLogRepository = appDataSource
    .getRepository(UserLogEntity)
    .extend({
        async createOne(data: UserLogData): Promise<UserLogEntity> {
            const log = new UserLogEntity();
            log.user = data.user;
            log.action = data.action;
            log.details = data.details;
            await this.save(log);

            return log;
        },
    });
