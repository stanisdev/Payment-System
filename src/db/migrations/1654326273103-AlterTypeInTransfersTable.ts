import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTypeInTransfersTable1654326273103
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE TransferType ADD VALUE IF NOT EXISTS 'Refund';
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- It's quite an unordinary situation to revert this migration
        `);
    }
}
