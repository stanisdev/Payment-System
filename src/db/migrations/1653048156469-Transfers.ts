import { MigrationInterface, QueryRunner } from 'typeorm';

export class Transfers1653048156469 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE TransferType AS ENUM ('Internal', 'Withdrawal', 'Replenishment');

            CREATE TABLE "Transfers" (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                "walletSenderId" INTEGER,
                "walletRecipientId" INTEGER,
                amount INTEGER NOT NULL,
                type TransferType NOT NULL,
                comment VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                CONSTRAINT fk_wallet_owner
                    FOREIGN KEY("walletSenderId")
                    REFERENCES "Wallets"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,

                CONSTRAINT fk_wallet_recipient
                    FOREIGN KEY("walletRecipientId")
                    REFERENCES "Wallets"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "Transfers";
            DROP TYPE IF EXISTS TransferType;
        `);
    }
}
