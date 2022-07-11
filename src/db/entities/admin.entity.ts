import { IsDate, Length, Min } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AdminLogEntity } from './adminLog.entity';
import { RoleEntity } from './role.entity';

@Entity('Admins')
export class AdminEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Length(1, 30)
    username: string;

    @Column()
    @Length(60)
    password: string;

    @Column()
    @Length(5)
    salt: string;

    @Column()
    @Min(0)
    status: number;

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;

    @UpdateDateColumn()
    @IsDate()
    updatedAt: Date;

    @OneToMany(() => AdminLogEntity, (adminLog) => adminLog.admin)
    logs: AdminLogEntity[];

    @ManyToMany(() => RoleEntity)
    @JoinTable({
        name: 'AdminRoles',
        joinColumn: {
            name: 'adminId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'roleId',
            referencedColumnName: 'id',
        },
    })
    roles: RoleEntity[];
}
