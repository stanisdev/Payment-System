import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdminRoles1656934877359 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE SEQUENCE AdminRoles_id_seq;

            CREATE TABLE "AdminRoles" (
                id INTEGER DEFAULT nextval('AdminRoles_id_seq') PRIMARY KEY,
                "adminId" INTEGER NOT NULL,
                "roleId" INTEGER NOT NULL,
                "createdAt" TIMESTAMP DEFAULT current_timestamp,

                UNIQUE("adminId", "roleId"),

                CONSTRAINT fk_admin
                    FOREIGN KEY("adminId")
                    REFERENCES "Admins"(id)
                    ON UPDATE RESTRICT
                    ON DELETE RESTRICT,

                CONSTRAINT fk_role
                    FOREIGN KEY("roleId")
                    REFERENCES "Roles"(id)
                    ON UPDATE RESTRICT
                    ON DELETE RESTRICT
            );
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "AdminRoles";
            DROP SEQUENCE IF EXISTS AdminRoles_id_seq;`);
    }
}
