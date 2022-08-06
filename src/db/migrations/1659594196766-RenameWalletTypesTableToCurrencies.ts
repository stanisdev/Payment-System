import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameWalletTypesTableToCurrencies1659594196766
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "WalletTypes" RENAME TO "Currencies";`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "Currencies" RENAME TO "WalletTypes";`,
        );
    }
}
