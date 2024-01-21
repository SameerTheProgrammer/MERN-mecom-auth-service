import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminEnitityAdminRefreshTokenEntity1705717590812
    implements MigrationInterface
{
    name = "AddAdminEnitityAdminRefreshTokenEntity1705717590812";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "admins" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "phoneNumber" bigint NOT NULL, "role" character varying NOT NULL DEFAULT 'admin', "avatar" jsonb, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_051db7d37d478a69a7432df1479" UNIQUE ("email"), CONSTRAINT "PK_e3b38270c97a854c48d2e80874e" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "adminRefreshTokens" ("id" SERIAL NOT NULL, "expireAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "adminId" integer, CONSTRAINT "PK_b3dfb7af4b46cb1027597639b4a" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "adminRefreshTokens" ADD CONSTRAINT "FK_c2c791fb4fead6adb3e567883c5" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "adminRefreshTokens" DROP CONSTRAINT "FK_c2c791fb4fead6adb3e567883c5"`,
        );
        await queryRunner.query(`DROP TABLE "adminRefreshTokens"`);
        await queryRunner.query(`DROP TABLE "admins"`);
    }
}
