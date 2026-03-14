import { db } from "./src/db";
import { sql } from "drizzle-orm";

async function check() {
  try {
    const result = await db.execute(sql`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`);
    console.log("Tables in database:", result);
    
    try {
      const trainingsResult = await db.execute(sql`SELECT count(*) FROM trainings`);
      console.log("Trainings table exists. Count:", trainingsResult);
    } catch (e) {
      console.error("Trainings table DOES NOT exist or error accessing it:", e instanceof Error ? e.message : e);
    }
  } catch (err) {
    console.error("Database connection error:", err instanceof Error ? err.message : err);
  }
  process.exit();
}

check();
