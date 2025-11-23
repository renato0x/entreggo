import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1763858513656 implements MigrationInterface {
    name = 'CreateCategories1763858513656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "icon" character varying, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."driver_categories_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "driver_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "driver_id" uuid NOT NULL, "category_id" uuid NOT NULL, "status" "public"."driver_categories_status_enum" NOT NULL DEFAULT 'pending', "verified_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dbeaffa42319ef238928480af09" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_9bb53cb4c941553750b89f350e0" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver_categories" ADD CONSTRAINT "FK_cd95ad5d814127ec1ac1ddb3338" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "driver_categories" ADD CONSTRAINT "FK_7b4a0c941f7eb8c222bed882f1c" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "driver_categories" DROP CONSTRAINT "FK_7b4a0c941f7eb8c222bed882f1c"`);
        await queryRunner.query(`ALTER TABLE "driver_categories" DROP CONSTRAINT "FK_cd95ad5d814127ec1ac1ddb3338"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_9bb53cb4c941553750b89f350e0"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "driver_categories"`);
        await queryRunner.query(`DROP TYPE "public"."driver_categories_status_enum"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
