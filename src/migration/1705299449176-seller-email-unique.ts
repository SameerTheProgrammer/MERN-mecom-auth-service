import { MigrationInterface, QueryRunner } from "typeorm";

export class SellerEmailUnique1705299449176 implements MigrationInterface {
    name = "SellerEmailUnique1705299449176";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'customer'`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellers" ADD CONSTRAINT "UQ_60a049dd3231ed458dccfdaf406" UNIQUE ("email")`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellers" ALTER COLUMN "avatar" DROP NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "sellers" ALTER COLUMN "avatar" SET NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellers" DROP CONSTRAINT "UQ_60a049dd3231ed458dccfdaf406"`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`,
        );
    }
}
