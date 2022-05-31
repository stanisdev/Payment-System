import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payees1652858771839 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

            CREATE TABLE "Payees" (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "userId" INTEGER NOT NULL,
                "walletId" INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(60),
                phone VARCHAR(50),
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                UNIQUE("userId", "walletId"),

                CONSTRAINT fk_user
                    FOREIGN KEY("userId")
                    REFERENCES "Users"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,

                CONSTRAINT fk_wallet
                    FOREIGN KEY("walletId")
                    REFERENCES "Wallets"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "Payees";
        `);
    }
}
