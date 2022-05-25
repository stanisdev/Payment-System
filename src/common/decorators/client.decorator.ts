import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import * as i18next from 'i18next';
import { ClientEntity } from 'src/db/entities';
import { clientRepository } from 'src/db/repositories';

export const GetClient = createParamDecorator(async function (
    data: unknown,
    ctx: ExecutionContext,
): Promise<ClientEntity> {
    const request = ctx.switchToHttp().getRequest();
    const client = await clientRepository.findOneBy({
        token: request.body.clientToken,
    });
    if (!(client instanceof ClientEntity)) {
        throw new BadRequestException(i18next.t('wrong-client-token'));
    }
    return client;
});
