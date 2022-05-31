import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1651390732641 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Users_id_seq;
            
            CREATE TABLE "Users" (
                id INTEGER DEFAULT nextval('Users_id_seq') PRIMARY KEY,
                "memberId" INTEGER NOT NULL UNIQUE,
                email VARCHAR(60) NOT NULL UNIQUE,
                password CHARACTER(60) NOT NULL,
                salt CHARACTER(5) NOT NULL,
                status SMALLINT DEFAULT 1,
                "createdAt" TIMESTAMP DEFAULT current_timestamp
            );

            CREATE INDEX idx_users_member_id ON "Users"("memberId");`);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_users_member_id;
            DROP TABLE IF EXISTS "Users";
            DROP SEQUENCE IF EXISTS Users_id_seq;`);
    }
}
