import { MigrationInterface, QueryRunner } from 'typeorm';

export class WalletCategories1652449464988 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE WalletCategories_id_seq;

            CREATE TABLE "WalletCategories" (
                id INTEGER DEFAULT nextval('WalletCategories_id_seq') PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT current_timestamp
            );

            INSERT INTO "WalletCategories"  (id, name)
                VALUES
                (1, 'Fiat currencies'),
                (2, 'Precious metals'),
                (3, 'Crypto currencies');
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "WalletCategories";
            DROP SEQUENCE WalletCategories_id_seq;
        `);
    }
}
