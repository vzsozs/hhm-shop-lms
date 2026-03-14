import { sql } from "drizzle-orm";
import { db } from "@/db";

export type DBTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * SEO-barát slug generáló bármilyen szövegből
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Ellenőrzi, hogy a megadott slug egyedi-e az adott táblában egy adott nyelven.
 * Ha nem, sorszámozott suffixszel (-2, -3 stb.) teszi egyedivé.
 * @param baseSlug Az alap slug (pl. "piros-alma")
 * @param lang A nyelv kódja (pl. "hu", "en", "sk")
 * @param tableName A cél tábla neve ("products", "categories" vagy "product_groups")
 * @param tx Opcionális Drizzle tranzakció objektum (race condition elkerülésére javasolt)
 * @param excludeId Opcionális ID amit ki kell hagyni az ellenőrzésből (pl. frissítésnél)
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  lang: string,
  tableName: "products" | "categories" | "product_groups",
  tx?: DBTransaction,
  excludeId?: string
): Promise<string> {
  const currentDb = tx || db;
  
  // Egyetlen DB hívással lekérjük az összes hasonló kezdetű slugot
  const query = sql`
    SELECT slug->>${lang} as slug_val 
    FROM ${sql.identifier(tableName)} 
    WHERE slug->>${lang} LIKE ${baseSlug + '%'}
    ${excludeId ? sql`AND id != ${excludeId}` : sql``}
  `;

  const existing = await currentDb.execute(query);
  const takenSlugs = new Set(existing.map((r) => (r as { slug_val: string }).slug_val));

  if (!takenSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (takenSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
