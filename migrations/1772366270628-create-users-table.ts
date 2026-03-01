import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1772366270628 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                "email" VARCHAR NOT NULL UNIQUE,
                "password" VARCHAR NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
