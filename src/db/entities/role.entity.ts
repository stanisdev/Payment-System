import { IsDate, Length } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminEntity } from './admin.entity';

@Entity('Roles')
export class RoleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Length(1, 30)
    name: string;

    @ManyToMany(() => AdminEntity, (admin) => admin.roles)
    admins: AdminEntity[];

    @CreateDateColumn()
    @IsDate()
    createdAt: Date;
}
