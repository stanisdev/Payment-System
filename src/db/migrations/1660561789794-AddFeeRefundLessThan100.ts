import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRefundLessThan1001660561789794
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Fees" (id, name, value, description, "isAvailable")
                VALUES
                (
                    2,
                    'RefundLessThan100',
                    20,
                    'Percentage of the system income that will not pay back after a refund less than 100',
                    true
                );
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Fees" WHERE id = 2;`);
    }
}
