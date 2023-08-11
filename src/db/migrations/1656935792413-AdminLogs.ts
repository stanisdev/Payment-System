import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminLogs1656935792413 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE AdminLogs_id_seq;

            CREATE TABLE "AdminLogs" (
                id INTEGER DEFAULT nextval('AdminLogs_id_seq') PRIMARY KEY,
                "adminId" INTEGER NOT NULL,
                action VARCHAR(30) NOT NULL,
                details VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                CONSTRAINT fk_admin
                    FOREIGN KEY("adminId")
                    REFERENCES "Admins"(id)
                    ON UPDATE RESTRICT
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "UserLogs";
            DROP SEQUENCE IF EXISTS UserLogs_id_seq;
            DROP SEQUENCE IF EXISTS AdminLogs_id_seq;
        `);
    }
}
