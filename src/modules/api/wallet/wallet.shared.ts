import i18next from 'i18next';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Currency } from 'src/common/enums';
import { UserEntity, WalletEntity } from 'src/db/entities';
import { walletRepository } from 'src/db/repositories';
import { EntityManager } from 'typeorm';
import { Utils } from '../../../common/utils';
import { WalletServiceRepository } from './wallet.repository';

@Injectable()
export class WalletSharedService {
    constructor(private readonly repository: WalletServiceRepository) {}

    /**
     * Create a wallet
     */
    async createWallet(
        currencyId: Currency,
        user: UserEntity,
        transactionalEntityManager?: EntityManager,
    ): Promise<WalletEntity> {
        const identifier = await this.generateIdentifier(currencyId);
        return this.repository.create(
            {
                user,
                identifier,
                currencyId,
            },
            transactionalEntityManager,
        );
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
}
