import { MigrationInterface, QueryRunner } from 'typeorm';

export class Cities1651392765382 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Cities_id_seq;

            CREATE TABLE "Cities" (
                id INTEGER DEFAULT nextval('Cities_id_seq') PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE
            );`);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "Cities";
            DROP SEQUENCE Cities_id_seq;`);
    }
}
