import { IsDate, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from './wallet.entity';
import { CurrencyCategoryEntity } from './currencyCategory.entity';
import { SystemIncomeEntity } from './systemIncome.entity';

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

    @OneToOne(() => SystemIncomeEntity, (systemIncome) => systemIncome.currency)
    systemIncome: SystemIncomeEntity;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
