import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1772388072933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "sessions" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "refreshToken" character varying NOT NULL,
                "ipAddress" character varying NOT NULL,
                "lang" character varying NOT NULL,
                "userAgent" character varying NOT NULL,
                "lastActivity" TIMESTAMP NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "isInvalidated" boolean NOT NULL DEFAULT false,
                "userId" uuid NOT NULL,
                CONSTRAINT "PK_sessions" PRIMARY KEY ("id"),
                CONSTRAINT "FK_sessions_users" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
  }
}
