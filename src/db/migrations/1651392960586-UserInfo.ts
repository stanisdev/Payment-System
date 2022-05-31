import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserInfo1651392960586 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE UserInfo_id_seq;

            CREATE TYPE Country AS ENUM ('Australia', 'Chile', 'Greece', 'Oman', 'Pakistan'); -- and so on
            CREATE TYPE Account AS ENUM ('Personal', 'Business');

            CREATE TABLE "UserInfo" (
                id INTEGER DEFAULT nextval('UserInfo_id_seq') PRIMARY KEY,
                "userId" INTEGER NOT NULL UNIQUE,
                "accountName" VARCHAR(50),
                "fullName" VARCHAR(100) NOT NULL,
                country Country NOT NULL,
                "cityId" INTEGER NOT NULL,
                address VARCHAR(150),
                "zipCode" INTEGER NOT NULL,
                phone VARCHAR(50),
                "accountType" Account NOT NULL,

                CONSTRAINT fk_user
                    FOREIGN KEY("userId")
                    REFERENCES "Users"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT,

                CONSTRAINT fk_city
                    FOREIGN KEY("cityId")
                    REFERENCES "Cities"(id)
                    ON UPDATE CASCADE
                    ON DELETE RESTRICT
            );`);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "UserInfo";
            DROP TYPE IF EXISTS Country;
            DROP TYPE IF EXISTS Account;
            DROP SEQUENCE IF EXISTS UserInfo_id_seq;`);
    }
}
