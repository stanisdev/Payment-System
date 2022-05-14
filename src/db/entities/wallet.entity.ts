import { IsDate } from 'class-validator';
import {
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WalletTypeEntity } from './walletType.entity';

@Entity('Wallets')
export class WalletEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.wallets)
    user: UserEntity;

    @ManyToOne(() => WalletTypeEntity, (type) => type.wallets)
    type: WalletTypeEntity;

    balance: number;

    identifier: number;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
