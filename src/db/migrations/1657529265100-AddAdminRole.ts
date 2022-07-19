import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminRole1657529265100 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO "Roles" (id, name) VALUES (1, 'admin');`,
        );
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Roles";`);
    }
}
