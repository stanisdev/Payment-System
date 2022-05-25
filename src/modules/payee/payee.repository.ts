import { Injectable } from '@nestjs/common';
import { BasicPayeeData } from 'src/common/types';
import { PayeeEntity, UserEntity, WalletEntity } from 'src/db/entities';
import { payeeRepository } from 'src/db/repositories';
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

    async doesPayeeExist(
        user: UserEntity,
        wallet: WalletEntity,
    ): Promise<boolean> {
        const payeeRecord = await payeeRepository
            .createQueryBuilder()
            .select('id')
            .where('"userId" = :userId', { userId: user.id })
            .andWhere('"walletId" = :walletId', { walletId: wallet.id })
            .getOne();
        return payeeRecord instanceof PayeeEntity;
    }

    async getPayees(
        user: UserEntity,
        limit: number,
        offset: number,
    ): Promise<PayeeEntity[]> {
        return payeeRepository
            .createQueryBuilder('payee')
            .leftJoinAndSelect('payee.wallet', 'wallet')
            .leftJoinAndSelect('wallet.type', 'walletType')
            .select([
                'payee.id',
                'payee.name',
                'payee.email',
                'payee.phone',
                'wallet.identifier',
                'walletType.name',
            ])
            .where('payee."userId" = :userId', { userId: user.id })
            .limit(limit)
            .offset(offset)
            .getMany();
    }
}
