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
import { WalletCategoryEntity } from './walletCategory.entity';

@Entity('WalletTypes')
export class WalletTypeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(1, 100)
    name: string;

    @ManyToOne(
        () => WalletCategoryEntity,
        (walletCategory) => walletCategory.types,
    )
    category: WalletCategoryEntity;

    @OneToMany(() => WalletEntity, (wallet) => wallet.currency)
    wallets: WalletEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
