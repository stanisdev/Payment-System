import { IsDate, IsInt, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { WalletEntity } from './wallet.entity';

@Entity('Payees')
export class PayeeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, (user) => user.payees)
    user: UserEntity;

    @Column()
    @IsInt()
    userId: number;

    @OneToOne(() => WalletEntity, (wallet) => wallet.payee)
    @JoinColumn()
    wallet: WalletEntity;

    @Column()
    @IsInt()
    walletId: number;

    @Column()
    @Length(1, 100)
    name: string;

    @Column({ nullable: true })
    @Length(6, 60)
    email: string;

    @Column({ nullable: true })
    @Length(7, 50)
    phone: string;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;

    getWalletIdentifier(): string {
        const { wallet } = this;
        return wallet.currency.name.substring(0, 1) + wallet.identifier;
    }
}
