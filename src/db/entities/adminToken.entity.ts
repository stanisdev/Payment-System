import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsDate, Length } from 'class-validator';
import { AdminEntity } from './admin.entity';

@Entity('AdminTokens')
export class AdminTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AdminEntity, (admin) => admin.tokens)
    admin: AdminEntity;

    @Column()
    @Length(30)
    serverCode: string;

    @Column()
    @Length(30)
    clientCode: string;

    @Column()
    @IsDate()
    expireAt: Date;
}
