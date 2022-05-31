import { MigrationInterface, QueryRunner } from 'typeorm';

export class WalletTypes1652449851103 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE WalletTypes_id_seq;

            CREATE TABLE "WalletTypes" (
                id INTEGER DEFAULT nextval('WalletTypes_id_seq') PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                "categoryId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                CONSTRAINT fk_category
                    FOREIGN KEY("categoryId")
                    REFERENCES "WalletCategories"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );

            INSERT INTO "WalletTypes"  (id, name, "categoryId")
                VALUES
                (1, 'U.S. Dollar', 1),
                (2, 'Euro', 1),
                (3, 'Gold', 2),
                (4, 'Bitcoin', 3);
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "WalletTypes";
            DROP SEQUENCE IF EXISTS WalletTypes_id_seq;
        `);
    }
}
