import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRelatedTokenIdToUserTokens1652252495666
    implements MigrationInterface
{
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "UserTokens"
                ADD COLUMN "relatedTokenId" INTEGER;

            ALTER TABLE "UserTokens"
                ADD CONSTRAINT fk_related_token_id
                FOREIGN KEY ("relatedTokenId") REFERENCES "UserTokens"(id);
        `);
    }
    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "UserTokens"
                DROP COLUMN "relatedTokenId";
        `);
    }
}
