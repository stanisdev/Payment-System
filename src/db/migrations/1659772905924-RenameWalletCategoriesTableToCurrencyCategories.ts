import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameWalletCategoriesTableToCurrencyCategories1659772905924
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "WalletCategories" RENAME TO "CurrencyCategories";`,
        );
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "CurrencyCategories" RENAME TO "WalletCategories";`,
        );
    }
}
