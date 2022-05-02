import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToOne,
} from 'typeorm';
import { IsInt, Min, IsEmail, IsDate, Length } from 'class-validator';
import { UserInfoEntity } from './userInfo.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsInt()
    @Min(1)
    memberId: number;

    @Column({ unique: true })
    @IsEmail()
    @Length(6, 60)
    email: string;

    @Column()
    @Length(60)
    password: string;

    @BeforeInsert()
    @BeforeUpdate()
    async cryptPassword() {
        this.password = '***' + this.salt; // add the logic
    }

    @Column()
    @Length(5)
    salt: string;

    @OneToOne(() => UserInfoEntity, (userInfo) => userInfo.user)
    userInfo: UserInfoEntity;

    @Column()
    @Min(0)
    status: number;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
