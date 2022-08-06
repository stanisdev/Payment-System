import { IsDate, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CurrencyEntity } from './currency.entity';

@Entity('WalletCategories')
export class WalletCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(1, 100)
    name: string;

    @OneToMany(() => CurrencyEntity, (currencies) => currencies.category)
    currencies: CurrencyEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
