import { MigrationInterface, QueryRunner } from 'typeorm';

export class Fees1659942230168 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Fees_id_seq;
            
            CREATE TABLE "Fees" (
                id INTEGER DEFAULT nextval('Fees_id_seq') PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                value INTEGER NOT NULL CHECK (value > 0),
                description VARCHAR(255),
                "isAvailable" BOOLEAN DEFAULT true,
                "createdAt" TIMESTAMP DEFAULT current_timestamp
            );
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "Fees";
            DROP SEQUENCE IF EXISTS Fees_id_seq;`);
    }
}
