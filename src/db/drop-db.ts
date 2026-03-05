import { drizzle } from "drizzle-orm/node-postgres";
import { resolve } from "path";
import { config } from "dotenv";
import { Client } from "pg";

// Környezeti változók betöltése a .env fájlból
config({ path: resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("❌ DATABASE_URL környezeti változó nincs beállítva a .env fájlban!");
}

async function main() {
  console.log("🔥 Adatbázis sémák törlése (DROP SCHEMA public CASCADE)...");
  
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    // Eldobjuk a public sémát, majd újra létrehozzuk üresen
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    
    console.log("✅ Adatbázis sémák sikeresen törölve és újratelepítve!");
  } catch (error) {
    console.error("❌ Hiba az adatbázis sémák törlésekor:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
