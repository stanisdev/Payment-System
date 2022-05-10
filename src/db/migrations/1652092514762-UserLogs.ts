import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserLogs1652092514762 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE UserLogs_id_seq;

            CREATE TABLE "UserLogs" (
                id INTEGER DEFAULT nextval('UserLogs_id_seq') PRIMARY KEY,
                "userId" INTEGER NOT NULL,
                action VARCHAR(30) NOT NULL,
                details VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                CONSTRAINT fk_user
                    FOREIGN KEY("userId")
                    REFERENCES "Users"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "UserLogs";
            DROP SEQUENCE UserLogs_id_seq;
        `);
    }
}
