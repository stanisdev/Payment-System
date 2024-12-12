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
import { WalletEntity } from './wallet.entity';
import { UserCodeEntity } from './userCode.entity';
import { PayeeEntity } from './payee.entity';
import { PrimaryUserInfo } from 'src/common/types/user.type';

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

    @OneToMany(() => WalletEntity, (wallet) => wallet.user)
    wallets: WalletEntity[];

    @OneToMany(() => UserCodeEntity, (code) => code.user)
    codes: UserCodeEntity[];

    @OneToMany(() => PayeeEntity, (payee) => payee.user)
    payees: PayeeEntity[];

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
            this.salt = Utils.generateRandomString({
                length: 5,
            });
            const salt = await bcrypt.genSalt();
            const hash = await bcrypt.hash(this.password + this.salt, salt);
            this.password = hash;
        }
    }

    setPrimaryInfo(params: PrimaryUserInfo): void {
        this.memberId = params.memberId;
        this.email = params.email;
        this.password = params.password;
        this.status = params.status;
    }
}
