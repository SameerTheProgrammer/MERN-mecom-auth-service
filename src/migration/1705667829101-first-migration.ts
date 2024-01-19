import { MigrationInterface, QueryRunner } from "typeorm";

export class FirstMigration1705667829101 implements MigrationInterface {
    name = "FirstMigration1705667829101";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'customer', CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "userRefreshTokens" ("id" SERIAL NOT NULL, "expireAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_e04af6e3b88b3994caa75b4a737" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "description" text, "address" character varying(255) NOT NULL, "phoneNumber" integer NOT NULL, "role" character varying NOT NULL DEFAULT 'seller', "avatar" jsonb, "zipCode" integer NOT NULL, "avaiableBalance" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_60a049dd3231ed458dccfdaf406" UNIQUE ("email"), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "sellerRefreshTokens" ("id" SERIAL NOT NULL, "expireAt" TIMESTAMP NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "sellerId" integer, CONSTRAINT "PK_ee061ef57985c2f2421281a2d42" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "userRefreshTokens" ADD CONSTRAINT "FK_f47ce15682bfba9fb3a0daaa798" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellerRefreshTokens" ADD CONSTRAINT "FK_47af80893643966bcf4dcff9834" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "sellerRefreshTokens" DROP CONSTRAINT "FK_47af80893643966bcf4dcff9834"`,
        );
        await queryRunner.query(
            `ALTER TABLE "userRefreshTokens" DROP CONSTRAINT "FK_f47ce15682bfba9fb3a0daaa798"`,
        );
        await queryRunner.query(`DROP TABLE "sellerRefreshTokens"`);
        await queryRunner.query(`DROP TABLE "sellers"`);
        await queryRunner.query(`DROP TABLE "userRefreshTokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
