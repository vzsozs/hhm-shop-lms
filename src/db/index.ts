import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Ha nincs DATABASE_URL (pl. Docker build közben), egy dummy értéket adunk,
// hogy a Next.js fordítása (static analysis) ne álljon le az importálásnál.
const connectionString = process.env.DATABASE_URL || "postgres://dummy:dummy@localhost:5432/dummy";

// Megakadályozzuk a többszörös kapcsolatot fejlesztés közben
const globalForDb = global as unknown as { client: postgres.Sql | undefined };

const client = globalForDb.client ?? postgres(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
