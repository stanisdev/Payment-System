import { IsDate, IsInt } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PayeeEntity } from './payee.entity';
import { TransferEntity } from './transfer.entity';
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

    @OneToOne(() => PayeeEntity, (payee) => payee.wallet)
    payee: PayeeEntity;

    @OneToMany(() => TransferEntity, (transfer) => transfer.walletSender)
    sentTransfer: TransferEntity[];

    @OneToMany(() => TransferEntity, (transfer) => transfer.walletRecipient)
    receivedTransfer: TransferEntity[];

    @Column()
    @IsInt()
    typeId: number;

    @Column()
    @IsInt()
    userId: number;

    @Column()
    @IsInt()
    balance: number;

    @Column()
    @IsInt()
    identifier: number;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;

    getFullIdentifier(): string {
        return this.type.name.substring(0, 1) + this.identifier;
    }
}
