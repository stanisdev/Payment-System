import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import * as i18next from 'i18next';
import { WalletEntity } from 'src/db/entities';
import { walletRepository } from 'src/db/repositories';

export const GetWallet = createParamDecorator(async function (
    data: unknown,
    ctx: ExecutionContext,
): Promise<WalletEntity | never> {
    const request = ctx.switchToHttp().getRequest();
    const { body } = request;
    const wallet = await walletRepository
        .createQueryBuilder('wallet')
        .leftJoinAndSelect('wallet.type', 'type')
        .where('wallet."typeId" = :typeId', { typeId: body.walletType })
        .andWhere('wallet.identifier = :identifier', {
            identifier: body.walletIdentifier,
        })
        .getOne();
    if (!(wallet instanceof WalletEntity)) {
        throw new BadRequestException(i18next.t('wrong-wallet-details'));
    }
    if (request.user.id === wallet.userId) {
        throw new BadRequestException(
            i18next.t('binding-own-wallet-is-prohibited'),
        );
    }
    return wallet;
});
