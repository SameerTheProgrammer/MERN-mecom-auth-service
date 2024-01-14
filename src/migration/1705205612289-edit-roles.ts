import { MigrationInterface, QueryRunner } from "typeorm";

export class EditRoles1705205612289 implements MigrationInterface {
    name = "EditRoles1705205612289";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'admin', 'seller', 'deliveryBoy')`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer'`,
        );
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "role"`);
        await queryRunner.query(
            `CREATE TYPE "public"."sellers_role_enum" AS ENUM('customer', 'admin', 'seller', 'deliveryBoy')`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellers" ADD "role" "public"."sellers_role_enum" NOT NULL DEFAULT 'seller'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."sellers_role_enum"`);
        await queryRunner.query(
            `ALTER TABLE "sellers" ADD "role" character varying NOT NULL DEFAULT 'Seller'`,
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(
            `ALTER TABLE "users" ADD "role" character varying NOT NULL`,
        );
    }
}
