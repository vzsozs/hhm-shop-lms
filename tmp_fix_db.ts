import postgres from "postgres";
import "dotenv/config";

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log("Adding group_id column to products...");
    await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "group_id" uuid`;
    
    console.log("Adding index on group_id...");
    await sql`CREATE INDEX IF NOT EXISTS "products_group_id_idx" ON "products" ("group_id")`;

    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
