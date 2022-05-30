import * as i18next from 'i18next';
import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import { PayeeEntity } from '../../db/entities';
import { payeeRepository } from '../../db/repositories';

export const GetPayee = createParamDecorator(async function (
    data: unknown,
    ctx: ExecutionContext,
): Promise<PayeeEntity | never> {
    const request = ctx.switchToHttp().getRequest();

    let payeeId = request.params.id;
    if (typeof payeeId !== 'string') {
        payeeId = request.body.payeeId;
    }
    const payee = await payeeRepository
        .createQueryBuilder('payee')
        .leftJoinAndSelect('payee.wallet', 'wallet')
        .leftJoinAndSelect('wallet.type', 'walletType')
        .where('payee.id = :id', { id: payeeId })
        .andWhere('payee.userId = :userId', { userId: request.user.id })
        .getOne();

    if (!(payee instanceof PayeeEntity)) {
        throw new BadRequestException(i18next.t('wrong-payee-id'));
    }
    return payee;
});
