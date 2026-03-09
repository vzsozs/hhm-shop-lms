import postgres from "postgres";
import "dotenv/config";

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log("Converting categories slug to jsonb...");
    // We already have name and description as jsonb, but slug was missed.
    await sql`ALTER TABLE "categories" ALTER COLUMN "slug" SET DATA TYPE jsonb USING jsonb_build_object('hu', slug)`;
    
    console.log("Adding new unique index for category hu slug...");
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "categories_slug_hu_idx" ON "categories" ((slug->>'hu'))`;

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
