require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log("Connecting to database...");
    await client.connect();
    console.log("Connected. Dropping tables...");
    await client.query('DROP TABLE IF EXISTS "product_media" CASCADE');
    await client.query('DROP TABLE IF EXISTS "product_variants" CASCADE');
    await client.query('DROP TABLE IF EXISTS "products" CASCADE');
    console.log("Tables dropped successfully.");
  } catch (err) {
    console.error("Error dropping tables:", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}

main();
