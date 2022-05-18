import * as i18next from 'i18next';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity, WalletEntity } from 'src/db/entities';
import { PayeeDto } from './dto/create.dto';
import { PayeeServiceRepository } from './payee.repository';
import {
    BasicPayeeData,
    Pagination,
    Payee,
    UserActivityData,
} from 'src/common/types';
import { UserActivityLogger } from 'src/common/userActivityLogger';
import { LoggerTemplate, UserAction } from 'src/common/enums';

@Injectable()
export class PayeeService {
    constructor(private readonly repository: PayeeServiceRepository) {}

    /**
     * Create a new payee with the given parameters
     */
    async create(user: UserEntity, dto: PayeeDto): Promise<void> {
        const wallet = await this.repository.findWallet(
            dto.walletType,
            dto.walletIdentifier,
        );
        if (!(wallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('wrong-wallet-details'));
        }
        if (await this.repository.doesPayeeExist(user, wallet)) {
            throw new BadRequestException(i18next.t('payee-already-exist'));
        }
        const payeeData: BasicPayeeData = {
            user,
            wallet,
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
        };
        await this.repository.create(payeeData);
        const logData: UserActivityData = {
            user,
            action: UserAction.CREATE,
            template: LoggerTemplate.PAYEE_ADDED,
            metadata: wallet.type.name.substring(0, 1) + wallet.identifier,
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Get the list of user payees
     */
    async getList(
        user: UserEntity,
        { limit, page }: Pagination,
    ): Promise<Payee[]> {
        const offset = limit * page;
        const payees = await this.repository.getPayees(user, limit, offset);

        return payees.map((payee) => {
            const { id, wallet, name, email, phone } = payee;
            const walletIdentifier =
                wallet.type.name.substring(0, 1) + wallet.identifier;
            return {
                id,
                wallet: walletIdentifier,
                name,
                email,
                phone,
            };
        });
    }
}
