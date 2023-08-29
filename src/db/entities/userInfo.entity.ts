import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { IsIn, IsInt, Length, Min } from 'class-validator';
import { UserEntity } from './user.entity';
import { CityEntity } from './city.entity';

@Entity('UserInfo')
export class UserInfoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, (user) => user.info)
    @JoinColumn()
    user: UserEntity;

    @Column()
    userId: number;

    @Column({ nullable: true })
    @Length(1, 50)
    accountName: string | null;

    @Column()
    @Length(3, 100)
    fullName: string;

    @Column()
    country: string;

    @ManyToOne(() => CityEntity, (city) => city.userInfo)
    city: CityEntity;

    @Column()
    cityId: number;

    @Column({ nullable: true })
    @Length(2, 150)
    address: string | null;

    @Column()
    @IsInt()
    @Min(1)
    zipCode: number;

    @Column({ nullable: true })
    @Length(10, 50)
    phone: string | null;

    @Column()
    @IsIn(['Personal', 'Business'])
    accountType: string;
}
