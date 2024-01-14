import { MigrationInterface, QueryRunner } from "typeorm";

export class EditSellerNameColumn1705247131746 implements MigrationInterface {
    name = "EditSellerNameColumn1705247131746";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "sellers" RENAME COLUMN "sellerName" TO "name"`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "sellers" RENAME COLUMN "name" TO "sellerName"`,
        );
    }
}
