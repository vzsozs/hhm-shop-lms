import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping tables...");
  await db.execute(sql`DROP TABLE IF EXISTS "product_media" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "product_variants" CASCADE`);
  await db.execute(sql`DROP TABLE IF EXISTS "products" CASCADE`);
  console.log("Tables dropped.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
