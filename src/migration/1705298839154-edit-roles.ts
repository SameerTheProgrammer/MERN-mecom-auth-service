import { MigrationInterface, QueryRunner } from "typeorm";

export class EditRoles1705298839154 implements MigrationInterface {
    name = "EditRoles1705298839154";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sellers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."sellers_role_enum"`);
        await queryRunner.query(
            `ALTER TABLE "sellers" ADD "role" character varying NOT NULL DEFAULT 'seller'`,
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(
            `ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'user'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
}
