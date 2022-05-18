import { Injectable } from '@nestjs/common';
import { BasicPayeeData } from 'src/common/types';
import { PayeeEntity, UserEntity, WalletEntity } from 'src/db/entities';
import { payeeRepository, walletRepository } from 'src/db/repositories';
import { InsertResult } from 'typeorm';

@Injectable()
export class PayeeServiceRepository {
    async create({
        user,
        wallet,
        name,
        email,
        phone,
    }: BasicPayeeData): Promise<InsertResult> {
        return payeeRepository
            .createQueryBuilder()
            .insert()
            .values({
                user,
                wallet,
                name,
                email,
                phone,
            })
            .execute();
    }

    async findWallet(typeId: number, identifier: number) {
        return walletRepository
            .createQueryBuilder('wallet')
            .leftJoinAndSelect('wallet.type', 'type')
            .where('wallet."typeId" = :typeId', { typeId })
            .andWhere('wallet.identifier = :identifier', { identifier })
            .getOne();
    }

    async doesPayeeExist(
        user: UserEntity,
        wallet: WalletEntity,
    ): Promise<boolean> {
        const payeeRecord = await payeeRepository
            .createQueryBuilder()
            .select()
            .where('"userId" = :userId', { userId: user.id })
            .andWhere('"walletId" = :walletId', { walletId: wallet.id })
            .getOne();
        return payeeRecord instanceof PayeeEntity;
    }
}
