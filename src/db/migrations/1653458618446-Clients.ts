import { MigrationInterface, QueryRunner } from 'typeorm';

export class Clients1653458618446 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Clients_id_seq;

            CREATE TABLE "Clients" (
                id INTEGER DEFAULT nextval('Clients_id_seq') PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                token VARCHAR(255) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP DEFAULT current_timestamp
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "Clients";
            DROP SEQUENCE Clients_id_seq;
        `);
    }
}
