import { MigrationInterface, QueryRunner } from 'typeorm';

export class Admins1656934801931 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Admins_id_seq;

            CREATE TABLE "Admins" (
                id INTEGER DEFAULT nextval('Admins_id_seq') PRIMARY KEY,
                username VARCHAR(30) NOT NULL UNIQUE,
                password CHARACTER(60) NOT NULL,
                salt CHARACTER(10) NOT NULL,
                status SMALLINT NOT NULL,
                "createdAt" TIMESTAMP DEFAULT current_timestamp,
                "updatedAt" TIMESTAMP DEFAULT current_timestamp
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "Admins";
            DROP SEQUENCE IF EXISTS Admins_id_seq;`);
    }
}
