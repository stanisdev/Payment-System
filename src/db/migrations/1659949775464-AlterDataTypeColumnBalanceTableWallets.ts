import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDataTypeColumnBalanceTableWallets1659949775464
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Wallets" ALTER COLUMN balance TYPE float8;
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Wallets" ALTER COLUMN balance TYPE INTEGER;
        `);
    }
}
