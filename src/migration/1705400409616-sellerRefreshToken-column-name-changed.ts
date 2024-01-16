import { MigrationInterface, QueryRunner } from "typeorm";

export class SellerRefreshTokenColumnNameChanged1705400409616
    implements MigrationInterface
{
    name = "SellerRefreshTokenColumnNameChanged1705400409616";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "sellerRefreshTokens" DROP CONSTRAINT "FK_a8f9bc09bafd1a98c27e66c611d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellerRefreshTokens" RENAME COLUMN "userId" TO "sellerId"`,
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
            `ALTER TABLE "sellerRefreshTokens" RENAME COLUMN "sellerId" TO "userId"`,
        );
        await queryRunner.query(
            `ALTER TABLE "sellerRefreshTokens" ADD CONSTRAINT "FK_a8f9bc09bafd1a98c27e66c611d" FOREIGN KEY ("userId") REFERENCES "sellers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }
}
