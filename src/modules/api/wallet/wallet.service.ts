import * as i18next from 'i18next';
import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerTemplate, UserAction, Currency } from '../../../common/enums';
import { WalletsListResult } from '../../../common/types/wallet.type';
import { UserActivityData } from '../../../common/types/user.type';
import { Pagination } from '../../../common/types/other.type';
import { UserActivityLogger } from '../../../common/providers/loggers/userActivity';
import { UserEntity } from '../../../db/entities';
import { WalletServiceRepository } from './wallet.repository';
import { WalletSharedService } from './wallet.shared';

@Injectable()
export class WalletService {
    constructor(
        private readonly repository: WalletServiceRepository,
        private readonly configService: ConfigService,
        private readonly walletSharedService: WalletSharedService,
    ) {}

    /**
     * Create a new user wallet
     */
    async create(currencyId: Currency, user: UserEntity): Promise<void> {
        if (typeof currencyId != 'number') {
            throw new BadRequestException(i18next.t('wrong-currency'));
        }
        const walletsCount = await this.repository.count(user, currencyId);

        if (walletsCount >= +this.configService.get('MAX_WALLETS_PER_USER')) {
            throw new BadRequestException(
                i18next.t('exceeded-amount-of-wallets'),
            );
        }
        const wallet = await this.walletSharedService.createWallet(
            currencyId,
            user,
        );
        const logData: UserActivityData = {
            user,
            action: UserAction.CREATE,
            template: LoggerTemplate.PLAIN,
            metadata: Currency[currencyId].substring(0, 1) + wallet.identifier,
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Get list of user's wallets
     */
    async getList(
        { limit, offset }: Pagination,
        user: UserEntity,
    ): Promise<WalletsListResult[]> {
        const wallets = await this.repository.getList(user, limit, offset);

        return wallets.map((wallet) => ({
            identifier: wallet.identifier,
            balance: wallet.balance,
            currency: wallet.currency.name,
        }));
    }
}
