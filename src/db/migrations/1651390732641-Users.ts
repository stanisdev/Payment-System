import { MigrationInterface, QueryRunner } from 'typeorm';

export class Users1651390732641 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE Users_id_seq;
            
            CREATE TABLE Users (
                id INTEGER DEFAULT nextval('Users_id_seq') PRIMARY KEY,
                memberId INTEGER NOT NULL,
                email VARCHAR(60) NOT NULL UNIQUE,
                password VARCHAR(60) NOT NULL,
                salt CHARACTER(5) NOT NULL,
                status SMALLINT DEFAULT 1,
                createdAt TIMESTAMP DEFAULT current_timestamp
            );`);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE Users;
            DROP SEQUENCE Users_id_seq;`);
    }
}
