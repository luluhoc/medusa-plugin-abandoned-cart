import { MigrationInterface, QueryRunner } from "typeorm"

class changeCart1707663842769 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE \"cart\"" + 
      " ADD COLUMN \"abandoned_cart_notification_date\" varchar," +
      " ADD COLUMN \"abandoned_cart_notification_sent\" boolean," +
      " ADD COLUMN \"abandoned_cart_notification_count\" int"
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE \"cart\"" + 
      " DROP COLUMN \"abandoned_cart_notification_date\"," +
      " DROP COLUMN \"abandoned_cart_notification_sent\"," +
      " DROP COLUMN \"abandoned_cart_notification_count\""
    )
  }
}

export default changeCart1707663842769