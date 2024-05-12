import { MigrationInterface, QueryRunner } from "typeorm";

class changeCartNew1715018283362 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "cart"' +
        ' ADD COLUMN "abandoned_completed_at" timestamptz,' +
        ' ADD COLUMN "abandoned_count" int,' +
        ' ADD COLUMN "abandoned_last_interval" bigint,' +
        ' ADD COLUMN "abandoned_lastdate" timestamptz,' +
        ' DROP COLUMN "abandoned_cart_notification_date",' +
        ' DROP COLUMN "abandoned_cart_notification_sent",' +
        ' DROP COLUMN "abandoned_cart_notification_count"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "cart"' +
        ' DROP COLUMN "abandoned_completed_at",' +
        ' DROP COLUMN "abandoned_count",' +
        ' DROP COLUMN "abandoned_last_interval",' +
        ' DROP COLUMN "abandoned_lastdate"',
    );
  }
}

export default changeCartNew1715018283362;
