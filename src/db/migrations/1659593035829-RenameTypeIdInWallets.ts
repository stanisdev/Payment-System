import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameTypeIdInWallets1659593035829 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Wallets"
                RENAME COLUMN "typeId" TO "currencyId";
        `);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "Wallets"
                RENAME COLUMN "currencyId" TO "typeId";
        `);
    }
}
