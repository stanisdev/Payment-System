import { MigrationInterface, QueryRunner } from 'typeorm';

export class SystemIncomes1659940305484 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE SystemIncomes_id_seq;

            CREATE TABLE "SystemIncomes" (
                id INTEGER DEFAULT nextval('SystemIncomes_id_seq') PRIMARY KEY,
                "currencyId" INTEGER NOT NULL,
                balance INTEGER DEFAULT 0,

                CONSTRAINT fk_currency
                    FOREIGN KEY("currencyId")
                    REFERENCES "Currencies"(id)
                    ON UPDATE RESTRICT
                    ON DELETE RESTRICT
            );
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "SystemIncomes";
            DROP SEQUENCE IF EXISTS SystemIncomes_id_seq;
        `);
    }
}
