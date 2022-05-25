import { Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Clients')
export class ClientEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Length(1, 100)
    name: string;

    @Column({ unique: true })
    @Length(1, 255)
    token: string;
}
