import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSellersTable1705205413341 implements MigrationInterface {
    name = "CreateSellersTable1705205413341";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "sellers" ("id" SERIAL NOT NULL, "sellerName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "description" text, "address" character varying(255) NOT NULL, "phoneNumber" integer NOT NULL, "role" character varying NOT NULL DEFAULT 'Seller', "avatar" jsonb NOT NULL, "zipCode" integer NOT NULL, "avaiableBalance" integer NOT NULL DEFAULT '0', "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_97337ccbf692c58e6c7682de8a2" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "sellers"`);
    }
}
