import {
    BadRequestException,
    Injectable,
    ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as i18next from 'i18next';
import { LoggerTemplate, UserAction, WalletType } from 'src/common/enums';
import {
    BasicWalletData,
    Pagination,
    UserActivityData,
    WalletCategory,
    WalletsListResult,
} from 'src/common/types';
import { UserActivityLogger } from 'src/common/userActivityLogger';
import { Utils } from 'src/common/utils';
import { UserEntity, WalletEntity } from 'src/db/entities';
import { walletRepository } from 'src/db/repositories';
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
    async create(walletType: WalletType, user: UserEntity): Promise<void> {
        if (typeof walletType != 'number') {
            throw new BadRequestException(i18next.t('wrong-wallet-type'));
        }
        const walletsCount = await this.repository.count(user, walletType);

        if (walletsCount >= +this.configService.get('MAX_WALLETS_PER_USER')) {
            throw new BadRequestException(
                i18next.t('exceeded-amount-of-wallets'),
            );
        }
        const identifier = await this.generateIdentifier(walletType);
        const walletData: BasicWalletData = {
            user,
            identifier,
            type: walletType,
        };
        await this.repository.create(walletData);
        const logData: UserActivityData = {
            user,
            action: UserAction.CREATE,
            template: LoggerTemplate.PLAIN,
            metadata: WalletType[walletType].substring(0, 1) + identifier,
        };
        await UserActivityLogger.write(logData);
    }

    /**
     * Generate an identifier of the being generated wallet
     */
    private async generateIdentifier(
        walletType: WalletType,
    ): Promise<number | never> {
        for (let a = 0; a < 100; a++) {
            const identifier = +(await Utils.generateRandomString({
                length: 8,
                onlyDigits: true,
            }));
            const record = await walletRepository.findOneBy({
                identifier,
                typeId: walletType,
            });
            if (!(record instanceof WalletEntity)) {
                return identifier;
            }
        }
        throw new ServiceUnavailableException(
            i18next.t('unable-to-generate-identifier'),
        );
    }

    /**
     * Get list of user's wallets
     */
    async getList({ limit, offset }: Pagination): Promise<WalletsListResult[]> {
        const wallets = await this.repository.getList(limit, offset);

        return wallets.map((wallet) => ({
            identifier: wallet.identifier,
            type: wallet.type.name,
        }));
    }

    /**
     * Get the list of wallet categories and their
     * related types
     */
    async getCategories({
        limit,
        offset,
    }: Pagination): Promise<WalletCategory[]> {
        return this.repository.getCategories(limit, offset);
    }
}
