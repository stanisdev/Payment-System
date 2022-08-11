import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeeInternalTransferMoreThan1001659947987485
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Fees" (id, name, value, description, "isAvailable")
                VALUES
                (
                    1,
                    'InternalTransferMoreThan100',
                    1.5,
                    'The fee that being taken while an internal transfer an amount more than 100',
                    true
                );
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Fees";`);
    }
}
