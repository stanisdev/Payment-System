import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, Length } from 'class-validator';
import { UserEntity } from './user.entity';
import { UserAction } from '../../common/enums';

@Entity('UserLogs')
export class UserLogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.logs)
    user: UserEntity;

    @Column()
    @Length(1, 30)
    action: UserAction;

    @Column()
    @Length(1, 255)
    details: string;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
