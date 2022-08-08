import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemIncomeUnits1659940714778 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "SystemIncomes"  (id, "currencyId", balance)
                VALUES
                (1, 1, 0),
                (2, 2, 0),
                (3, 3, 0),
                (4, 4, 0);
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "SystemIncomes";`);
    }
}
