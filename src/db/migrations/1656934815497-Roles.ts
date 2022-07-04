import { MigrationInterface, QueryRunner } from 'typeorm';

export class Roles1656934815497 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Roles_id_seq;

            CREATE TABLE "Roles" (
                id INTEGER DEFAULT nextval('Roles_id_seq') PRIMARY KEY,
                name VARCHAR(30) NOT NULL UNIQUE,
                "createdAt" TIMESTAMP DEFAULT current_timestamp
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "Roles";
            DROP SEQUENCE IF EXISTS Roles_id_seq;`);
    }
}
