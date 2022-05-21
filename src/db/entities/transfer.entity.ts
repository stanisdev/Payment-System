import { IsDate, IsInt, Length } from 'class-validator';
import { TransferType } from 'src/common/enums';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';

@Entity('Transfers')
export class TransferEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.sentTransfer)
    walletSender: WalletEntity;

    @ManyToOne(() => WalletEntity, (wallet) => wallet.receivedTransfer)
    walletRecipient: WalletEntity;

    @Column()
    @IsInt()
    walletSenderId: number;

    @Column()
    @IsInt()
    walletRecipientId: number;

    @Column()
    @IsInt()
    amount: number;

    @Column()
    type: TransferType;

    @Column({ nullable: true })
    @Length(1, 255)
    comment: string;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
