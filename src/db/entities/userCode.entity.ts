import { IsDate, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('UserCodes')
export class UserCodeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.codes)
    user: UserEntity;

    @Column()
    @Length(1, 20)
    code: string;

    @Column()
    @Length(1, 100)
    action: string;

    @Column()
    @IsDate()
    expireAt: Date;
}
