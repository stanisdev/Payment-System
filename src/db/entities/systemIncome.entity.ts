import { IsNumber, IsPositive } from 'class-validator';
import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CurrencyEntity } from './currency.entity';

@Entity('SystemIncomes')
export class SystemIncomeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => CurrencyEntity, (currency) => currency.systemIncome)
    @JoinColumn()
    currency: CurrencyEntity;

    @Column()
    @IsNumber()
    @IsPositive()
    balance: number;
}
