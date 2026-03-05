TRUNCATE "products" CASCADE;
ALTER TABLE "products" ALTER COLUMN "name" SET DATA TYPE jsonb USING name::jsonb;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" SET DATA TYPE jsonb USING description::jsonb;