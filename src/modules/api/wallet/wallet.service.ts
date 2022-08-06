import * as i18next from 'i18next';
import {
    BadRequestException,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerTemplate, UserAction, Currency } from '../../../common/enums';
import {
    BasicWalletData,
    WalletCategory,
    WalletsListResult,
} from '../../../common/types/wallet.type';
import { UserActivityData } from '../../../common/types/user.type';
import { Pagination } from '../../../common/types/other.type';
import { UserActivityLogger } from '../../../common/helpers/userActivityLogger';
import { Utils } from '../../../common/utils';
import { UserEntity, WalletEntity } from '../../../db/entities';
import { walletRepository } from '../../../db/repositories';
import { WalletServiceRepository } from './wallet.repository';

@Injectable()
export class WalletService {
    constructor(
        private readonly repository: WalletServiceRepository,
        private readonly configService: ConfigService,
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
        const identifier = await this.generateIdentifier(currencyId);
        const walletData: BasicWalletData = {
            user,
            identifier,
            currencyId,
        };
        await this.repository.create(walletData);
        const logData: UserActivityData = {
            user,
            action: UserAction.CREATE,
            template: LoggerTemplate.PLAIN,
            metadata: Currency[currencyId].substring(0, 1) + identifier,
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Generate an identifier of the being generated wallet
     */
    private async generateIdentifier(
        currencyId: Currency,
    ): Promise<number | never> {
        for (let a = 0; a < 100; a++) {
            const identifier = +(await Utils.generateRandomString({
                length: 8,
                onlyDigits: true,
            }));
            const record = await walletRepository.findOneBy({
                identifier,
                currencyId,
            });
            if (!(record instanceof WalletEntity)) {
                return identifier;
            }
        }
        throw new ServiceUnavailableException(
            i18next.t('unable-to-generate-wallet-identifier'),
        );
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

    /**
     * Get the list of wallet categories and their
     * related currencies
     */
    async getCategories({
        limit,
        offset,
    }: Pagination): Promise<WalletCategory[]> {
        return this.repository.getCategories(limit, offset);
    }
}
