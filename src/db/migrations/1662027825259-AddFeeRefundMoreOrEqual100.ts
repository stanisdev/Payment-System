import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeRefundMoreOrEqual1001662027825259
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Fees" (id, name, value, description, "isAvailable")
                VALUES
                (
                    3,
                    'RefundMoreOrEqual100',
                    50,
                    'Percentage of the system income that will not pay back after a refund more or equal 100',
                    true
                );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Fees" WHERE id = 3;`);
    }
}
