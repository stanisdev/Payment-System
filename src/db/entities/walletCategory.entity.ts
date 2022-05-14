import { IsDate, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletTypeEntity } from './walletType.entity';

@Entity('WalletCategories')
export class WalletCategoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(1, 100)
    name: string;

    @OneToMany(() => WalletTypeEntity, (walletType) => walletType.category)
    types: WalletTypeEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
