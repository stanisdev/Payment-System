import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClients1653459331649 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "Clients" (name, token)
                VALUES
                ('City mall', 'zAqVzCuhM6WPRJaT62HRS3BXn3ksYpRVALg74H8QuHpDmXHxMSf5JpepfpeGzNmRxmt'),
                ('Gold Bank', 'Z3pKwRYNWuXLLYWASmLKdPkRaX987P2j2rS3CuYTR7y7Qf5mzM3vkhXmVumbt3QkURF');
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "Clients";
        `);
    }
}
