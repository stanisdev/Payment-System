import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminTokens1657539220644 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE AdminTokens_id_seq;
                
            CREATE TABLE "AdminTokens" (
                id INTEGER DEFAULT nextval('AdminTokens_id_seq') PRIMARY KEY,
                "adminId" INTEGER NOT NULL,
                "serverCode" CHARACTER(30) NOT NULL,
                "clientCode" CHARACTER(30) NOT NULL,
                "expireAt" TIMESTAMP NOT NULL,

                CONSTRAINT fk_admin
                    FOREIGN KEY("adminId")
                    REFERENCES "Admins"(id)
                    ON UPDATE CASCADE
                    ON DELETE CASCADE
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "AdminTokens";
            DROP SEQUENCE IF EXISTS AdminTokens_id_seq;
        `);
    }
}
