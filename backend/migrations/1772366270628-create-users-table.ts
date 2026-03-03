import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1772366270628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "email" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL,
                "role" VARCHAR NOT NULL DEFAULT 'user' CHECK ("role" IN ('admin', 'user')),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
