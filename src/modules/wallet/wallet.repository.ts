import { Injectable } from '@nestjs/common';
import { WalletType } from 'src/common/enums';
import { BasicWalletData } from 'src/common/types';
import { UserEntity } from 'src/db/entities';
import { walletRepository } from 'src/db/repositories';

@Injectable()
export class WalletServiceRepository {
    constructor() {}

    async create(data: BasicWalletData) {
        return walletRepository
            .createQueryBuilder()
            .insert()
            .values({
                user: data.user,
                balance: 0,
                identifier: data.identifier,
                typeId: data.type,
            })
            .execute();
    }

    async count(user: UserEntity, walletType: WalletType): Promise<number> {
        const { count } = await walletRepository
            .createQueryBuilder('wallet')
            .select('COUNT(wallet.id) as count')
            .where('"userId" = :userId', { userId: user.id })
            .andWhere('"typeId" = :typeId', { typeId: walletType })
            .getRawOne();
        return +count;
    }
}
