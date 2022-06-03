import * as moment from 'moment';
import * as i18next from 'i18next';
import { strictEqual } from 'assert';
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { transferRepository } from 'src/db/repositories';
import { TransferType } from '../enums';

export class WithdrawalRestriction implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { body } = request;

        const data = await transferRepository
            .createQueryBuilder('transfer')
            .leftJoinAndSelect('transfer.walletSender', 'wallet')
            .select('SUM(transfer.amount)', 'sum')
            .where('transfer.type = :transferType')
            .andWhere('wallet.identifier = :walletIdentifier')
            .andWhere('wallet.typeId = :walletType')
            .andWhere('wallet.userId = :userId')
            .andWhere('transfer."createdAt" > :createdFrom')
            .setParameters({
                transferType: TransferType.WITHDRAWAL,
                walletIdentifier: body.walletIdentifier,
                walletType: body.walletType,
                userId: request.user.id,
                createdFrom: moment().subtract(1, 'day').toDate(),
            })
            .getRawOne();
        let sum: number;
        try {
            sum = +data.sum;
            strictEqual(Number.isInteger(sum), true);
            strictEqual(
                sum + +body.amount <=
                    +process.env.MAX_WITHDRAWAL_AMOUNT_PER_DAY,
                true,
            );
        } catch {
            throw new ForbiddenException(
                i18next.t('withdrawal-limit-has-been-exceeded', {
                    amount: sum,
                }),
            );
        }
        return true;
    }
}
