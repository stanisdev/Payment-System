import { IsDate, IsInt, Length } from 'class-validator';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { UserTokenType } from '../../common/enums';

@Entity('UserTokens')
export class UserTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, (user) => user.tokens)
    user: UserEntity;

    @Column()
    type: UserTokenType;

    @Column()
    @Length(20)
    code: string;

    @Column()
    @IsInt()
    relatedTokenId: number;

    @Column()
    @IsDate()
    expireAt: Date;
}
