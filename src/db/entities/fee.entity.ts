import { IsDate, IsNumber, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Fees')
export class FeeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Length(1, 50)
    name: string;

    @Column()
    @IsNumber()
    value: number;

    @Column()
    @Length(255)
    description: string;

    @Column()
    isAvailable: boolean;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;

    calculatePercentage(amount: number): number {
        return Math.round((this.value / 100) * amount * 100) / 100;
    }
}
