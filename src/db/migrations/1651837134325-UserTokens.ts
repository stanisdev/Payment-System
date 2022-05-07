import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTokens1651837134325 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE UserTokens_id_seq;
            CREATE TYPE UserTokenType AS ENUM ('Access', 'Refresh');

            CREATE TABLE UserTokens (
                id INTEGER DEFAULT nextval('UserTokens_id_seq') PRIMARY KEY,
                "userId" INTEGER NOT NULL,
                type UserTokenType NOT NULL,
                code VARCHAR(20) NOT NULL,
                "expireAt" TIMESTAMP NOT NULL
            );        
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE UserTokens;
            DROP TYPE UserTokenType;
            DROP SEQUENCE UserTokens_id_seq;
        `);
    }
}
