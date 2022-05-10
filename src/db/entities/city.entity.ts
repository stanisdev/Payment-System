import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Length } from 'class-validator';
import { UserInfoEntity } from './userInfo.entity';

@Entity('Cities')
export class CityEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Length(2, 50)
    name: string;

    @OneToMany(() => UserInfoEntity, (userInfo) => userInfo.city)
    userInfo: UserInfoEntity[];
}
