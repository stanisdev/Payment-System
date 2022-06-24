import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTransferType1655990149322 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE TransferType ADD VALUE IF NOT EXISTS 'InvoiceCreated';
            ALTER TYPE TransferType ADD VALUE IF NOT EXISTS 'InvoicePaid';
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            -- It's quite an unordinary situation to revert this migration
        `);
    }
}
