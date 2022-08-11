import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDataTypeColumnValueTableFees1659948917639
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Fees" ALTER COLUMN value TYPE float8;
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Fees" ALTER COLUMN value TYPE INTEGER;
        `);
    }
}
