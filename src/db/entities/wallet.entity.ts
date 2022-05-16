import { IsDate, IsInt } from 'class-validator';
import {
    Column,
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

    @Column()
    @IsInt()
    typeId: number;

    @Column()
    @IsInt()
    balance: number;

    @Column()
    @IsInt()
    identifier: number;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
