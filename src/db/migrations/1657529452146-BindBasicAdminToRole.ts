import { MigrationInterface, QueryRunner } from 'typeorm';

export class BindBasicAdminToRole1657529452146 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO "AdminRoles" ("adminId", "roleId") VALUES (1, 1);`,
        );
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "AdminRoles";`);
    }
}
