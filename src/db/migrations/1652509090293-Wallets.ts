import { MigrationInterface, QueryRunner } from 'typeorm';

export class Wallets1652509090293 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Wallets_id_seq;

            CREATE TABLE "Wallets" (
                id INTEGER DEFAULT nextval('Wallets_id_seq') PRIMARY KEY,
                "userId" INTEGER NOT NULL,
                "typeId" INTEGER NOT NULL,
                balance INTEGER DEFAULT 0,
                identifier INTEGER NOT NULL,
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                UNIQUE("typeId", identifier),

                CONSTRAINT fk_user
                    FOREIGN KEY("userId")
                    REFERENCES "Users"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,

                CONSTRAINT fk_type
                    FOREIGN KEY("typeId")
                    REFERENCES "WalletTypes"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "Wallets";
            DROP SEQUENCE Wallets_id_seq;
        `);
    }
}
