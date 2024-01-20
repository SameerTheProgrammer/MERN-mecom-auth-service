import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPhoneNumberAvatarColsInUserEnitity1705744260697
    implements MigrationInterface
{
    name = "AddPhoneNumberAvatarColsInUserEnitity1705744260697";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ADD "phoneNumber" integer`,
        );
        await queryRunner.query(`ALTER TABLE "users" ADD "avatar" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
        await queryRunner.query(
            `ALTER TABLE "users" DROP COLUMN "phoneNumber"`,
        );
    }
}
