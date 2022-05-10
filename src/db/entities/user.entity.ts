import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    OneToOne,
    AfterLoad,
    OneToMany,
} from 'typeorm';
import { IsInt, Min, IsEmail, IsDate, Length } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Utils } from '../../common/utils';
import { UserInfoEntity } from './userInfo.entity';
import { UserTokenEntity } from './userToken.entity';
import { UserLogEntity } from './userLog.entity';

@Entity('Users')
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

    @Column()
    @Length(5)
    salt: string;

    @OneToOne(() => UserInfoEntity, (userInfo) => userInfo.user)
    info: UserInfoEntity;

    @Column()
    @Min(0)
    status: number;

    @OneToMany(() => UserTokenEntity, (userToken) => userToken.user)
    tokens: UserTokenEntity[];

    @OneToMany(() => UserLogEntity, (userLog) => userLog.user)
    logs: UserLogEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;

    private recentPassword: string;

    @AfterLoad()
    private setRecentPassword() {
        this.recentPassword = this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    private async cryptPassword() {
        if (
            this.recentPassword !== this.password &&
            typeof this.password == 'string'
        ) {
            this.salt = await Utils.generateRandomString({
                length: 5,
            });
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(this.password + this.salt, salt);
            this.password = hash;
        }
    }
}
