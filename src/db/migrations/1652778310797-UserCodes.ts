import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCodes1652778310797 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE UserCodes_id_seq;

            CREATE TABLE "UserCodes" (
                id INTEGER DEFAULT nextval('UserCodes_id_seq') PRIMARY KEY,
                "userId" INTEGER NOT NULL,
                code VARCHAR(20) NOT NULL,
                action VARCHAR(100) NOT NULL,
                "expireAt" TIMESTAMP NOT NULL,

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
            DROP TABLE "UserCodes";
            DROP SEQUENCE UserCodes_id_seq;
        `);
    }
}
