import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBasicAdmin1657528736074 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Admins"  (id, username, password, salt, status)
                VALUES
                (1, 'ti5iV0', '$2b$10$58sFnyXsZ7smVSMhQiAUk.SmsTcG98sQkrZoZVIHnai/bG5uhXS.m', '7Ry0m9HuT3', 1);
            -- pwd 174kGjk4
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "Admins";`);
    }
}
