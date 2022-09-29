import i18next from 'i18next';
import { BadRequestException, Injectable } from '@nestjs/common';
import { FindWalletCriteria } from 'src/common/types/wallet.type';
import { WalletEntity } from 'src/db/entities';
import { TransferServiceRepository } from './transfer.repository';

@Injectable()
export class TransferUtility {
    constructor(private readonly repository: TransferServiceRepository) {}

    /**
     * Find and get a wallet by the given search criteria
     */
    async getWallet(data: FindWalletCriteria): Promise<WalletEntity | never> {
        const wallet = await this.repository.getWallet(data);
        if (!(wallet instanceof WalletEntity)) {
            throw new BadRequestException(i18next.t('wallet-not-found'));
        }
        return wallet;
    }
}
