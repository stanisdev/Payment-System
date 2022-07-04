import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, Length } from 'class-validator';
import { AdminAction } from '../../common/enums';
import { AdminEntity } from './admin.entity';

@Entity('AdminLogs')
export class AdminLogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => AdminEntity, (admin) => admin.logs)
    admin: AdminEntity;

    @Column()
    @Length(1, 30)
    action: AdminAction;

    @Column()
    @Length(1, 255)
    details: string;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
