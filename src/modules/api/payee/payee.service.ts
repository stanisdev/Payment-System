import * as i18next from 'i18next';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PayeeEntity, UserEntity, WalletEntity } from '../../../db/entities';
import { PayeeDto } from './dto/create.dto';
import { PayeeServiceRepository } from './payee.repository';
import {
    BasicPayeeData,
    Payee,
    UpdatePayeeData,
} from '../../../common/types/payee.type';
import { Pagination } from '../../../common/types/other.type';
import { UserActivityData } from '../../../common/types/user.type';
import { UserActivityLogger } from '../../../common/helpers/userActivityLogger';
import { LoggerTemplate, UserAction } from '../../../common/enums';
import { payeeRepository } from '../../../db/repositories';

@Injectable()
export class PayeeService {
    constructor(private readonly repository: PayeeServiceRepository) {}

    /**
     * Create a new payee with the given parameters
     */
    async create(
        dto: PayeeDto,
        wallet: WalletEntity,
        user: UserEntity,
    ): Promise<void> {
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
            metadata: wallet.getFullIdentifier(),
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Get the list of user payees
     */
    async getList(
        user: UserEntity,
        { limit, offset }: Pagination,
    ): Promise<Payee[]> {
        const payees = await this.repository.getPayees(user, limit, offset);
        return payees.map((payee) => {
            const { id, name, email, phone } = payee;
            return {
                id,
                wallet: payee.getWalletIdentifier(),
                name,
                email,
                phone,
            };
        });
    }

    /**
     * Update user's payee
     */
    async update(
        dto: PayeeDto,
        { wallet, payee, user }: UpdatePayeeData,
    ): Promise<void> {
        if (wallet.getFullIdentifier() !== payee.getWalletIdentifier()) {
            payee.wallet = wallet;
        }
        payee.name = dto.name;
        payee.email = dto.email;
        payee.phone = dto.phone;
        await payeeRepository.save(payee);

        const logData: UserActivityData = {
            user,
            action: UserAction.CHANGE,
            template: LoggerTemplate.PAYEE_UPDATED,
            metadata: wallet.getFullIdentifier(),
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Remove user's payee
     */
    async remove(payee: PayeeEntity, user: UserEntity): Promise<void> {
        const logData: UserActivityData = {
            user,
            action: UserAction.REMOVE,
            template: LoggerTemplate.PAYEE_REMOVED,
            metadata: payee.wallet.getFullIdentifier(),
        };
        await payeeRepository.remove(payee);
        await UserActivityLogger.write(logData);
    }
}
