import { IsDate, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';
import { CurrencyCategoryEntity } from './currencyCategory.entity';

@Entity('Currencies')
export class CurrencyEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(1, 100)
    name: string;

    @ManyToOne(
        () => CurrencyCategoryEntity,
        (currencyCategory) => currencyCategory.currencies,
    )
    category: CurrencyCategoryEntity;

    @OneToMany(() => WalletEntity, (wallet) => wallet.currency)
    wallets: WalletEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
