import { IsDate, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserTokenType } from '../../common/enums';

@Entity('usertokens')
export class UserTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.userTokens)
    user: UserEntity;

    @Column()
    type: UserTokenType;

    @Column()
    @Length(20)
    code: string;

    @Column()
    @IsDate()
    expireAt: Date;
}
