import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, categories, syncLogs } from "@/db/schema/shop";
import { eq, sql, and, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";
import DOMPurify from "isomorphic-dompurify";
import { MEINL_SYNC_CONFIG } from "@/config/meinl-sync";

const SPEC_MAPPING: Record<string, { en: string; hu: string }> = {
  "Material": { en: "Material", hu: "Anyag" },
  "Weight": { en: "Weight", hu: "Súly" },
  "Width": { en: "Width", hu: "Szélesség" },
  "Height": { en: "Height", hu: "Magasság" },
  "Depth": { en: "Depth", hu: "Mélység" },
  "Color": { en: "Color", hu: "Szín" },
  "Size": { en: "Size", hu: "Méret" },
  "Chakra": { en: "Chakra", hu: "Csakra" },
  "Anyag": { en: "Material", hu: "Anyag" },
  "Tuning": { en: "Tuning", hu: "Hangolás" },
  "Diameter": { en: "Diameter", hu: "Átmérő" },
  "Strings": { en: "Strings", hu: "Húrok száma" },
  "Origin": { en: "Origin", hu: "Származás" },
};

const SPEC_EXCLUDE = [
  "Item",
  "Product Name",
  "Product Description",
  "MSRP",
  "Purchase price",
  "Weight",
  "Width",
  "Height",
  "Depth",
  "Stock",
  "Media URL",
  "Available",
  "Category",
  "Group",
  "USP 1", "USP 2", "USP 3", "USP 4", "USP 5", "USP 6", "USP 7", "USP 8", "USP 9", "USP 10",
  "USP1", "USP2", "USP3", "USP4", "USP5", "USP6", "USP7", "USP8", "USP9", "USP10",
  "Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6", "Feature 7", "Feature 8", "Feature 9", "Feature 10",
  "Feature1", "Feature2", "Feature3", "Feature4", "Feature5", "Feature6", "Feature7", "Feature8", "Feature9", "Feature10",
];

// Slug generáló (másolva az actions.ts-ből)
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseMeinlFloat(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return value;
  const str = String(value).trim().replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

async function ensureUniqueSlug(baseSlug: string, lang: string, excludeId?: string): Promise<string> {
  const existing = await db.execute(
    sql`SELECT slug->>${lang} as slug_val FROM products WHERE slug->>${lang} LIKE ${baseSlug + '%'} ${excludeId ? sql`AND id != ${excludeId}` : sql``}`
  );

  const takenSlugs = new Set((existing as unknown as { slug_val: string }[]).map((r) => r.slug_val));

  if (!takenSlugs.has(baseSlug)) return baseSlug;

  let counter = 2;
  while (takenSlugs.has(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}

export type SyncResult = {
  processed: number;
  updated: number;
  inserted: number;
  deactivated: number;
  errors: string[];
  successSkus: string[];
  errorSkus: { sku: string; error: string }[];
  skippedSkus: string[];
};

export async function syncMeinlData(fileBuffer: Buffer): Promise<SyncResult> {
  // UTF-8-SIG kezelése: az XLSX.read buffer-ből általában jól kezeli a BOM-ot.
  const workbook = XLSX.read(fileBuffer, { type: "buffer", codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];

  const result: SyncResult = {
    processed: 0,
    updated: 0,
    inserted: 0,
    deactivated: 0,
    errors: [],
    successSkus: [],
    errorSkus: [],
    skippedSkus: [],
  };

  if (data.length === 0) return result;

  // 1. Kategóriák betöltése a gyorsabb kereséshez
  const allCategories = await db.select().from(categories);
  
  // 2. Eddigi Meinl termékek SKUi (deaktiváláshoz)
  const existingMeinlProducts = await db
    .select({ sku: productVariants.sku, productId: products.id })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(eq(products.type, MEINL_SYNC_CONFIG.PRODUCT_TYPE));
  
  const processedSkus = new Set<string>();

  // 3. Oszlopnevek ellenőrzése (opcionális logoláshoz)
  const knownColumns = [
    "Item", "Product Name", "Product Description", "USP 1", "USP 2", "USP 3", "USP 4", "USP 5",
    "Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5",
    "MSRP", "Purchase price", "Weight", "Width", "Height", "Depth", "Media URL",
    "Anyag", "Chakra"
  ];

  for (const row of data) {
    try {
      // Ismeretlen oszlopok logolása
      Object.keys(row).forEach(col => {
        if (!knownColumns.some(k => col.startsWith(k)) && !knownColumns.includes(col)) {
          // Csak egyszer logoljuk vagy konzolba
          // console.log(`Ismeretlen oszlop: ${col}, figyelmen kívül hagyva`);
        }
      });

      const sku = String(row["Item"] || "").trim();
      if (!sku) {
        result.skippedSkus.push("N/A (Hiányzó cikkszám)");
        continue;
      }

      processedSkus.add(sku);
      result.processed++;

      // HTML Tisztítás (csak p, ul, li megengedett)
      const cleanHTML = (html: string) => {
        return DOMPurify.sanitize(html || "", {
          ALLOWED_TAGS: ["p", "ul", "li", "br", "strong", "b", "i", "em"],
          ALLOWED_ATTR: [],
        });
      };

      const nameEn = String(row["Product Name"] || "");
      const descEn = cleanHTML(String(row["Product Description"] || ""));

      // USP és Feature összefűzése
      let shortDescHtml = "<ul>";
      for (let i = 1; i <= 10; i++) {
        const usp = row[`USP ${i}`] || row[`USP${i}`];
        const feat = row[`Feature ${i}`] || row[`Feature${i}`];
        if (usp) shortDescHtml += `<li>${DOMPurify.sanitize(String(usp))}</li>`;
        if (feat) shortDescHtml += `<li>${DOMPurify.sanitize(String(feat))}</li>`;
      }
      shortDescHtml += "</ul>";
      if (shortDescHtml === "<ul></ul>") shortDescHtml = "";

      // Ár számítás
      const msrp = parseMeinlFloat(row["MSRP"]);
      const purchasePrice = parseMeinlFloat(row["Purchase price"]);
      const priceEur = msrp > 0 ? msrp : purchasePrice;
      const priceHuf = Math.round(priceEur * MEINL_SYNC_CONFIG.EXCHANGE_RATE);

      // Specifikációk gyűjtése dinamikusan
      const specifications: { key_en: string; key_hu: string; value_en: string; value_hu: string; key_sk: string; value_sk: string }[] = [];
      
      Object.keys(row).forEach((key) => {
        const value = row[key];
        if (value === null || value === undefined || value === "" || SPEC_EXCLUDE.includes(key)) {
          return;
        }

        const mapping = SPEC_MAPPING[key];
        const key_en = mapping ? mapping.en : key;
        const key_hu = mapping ? mapping.hu : key;
        const val = String(value).trim();

        specifications.push({
          key_en,
          key_hu,
          value_en: val,
          value_hu: val,
          key_sk: "",
          value_sk: "",
        });
      });

      // Tranzakció minden termékre
      await db.transaction(async (tx) => {
        // Ellenőrizzük, létezik-e a variáns SKU alapján
        const [existingVariant] = await tx
          .select()
          .from(productVariants)
          .where(eq(productVariants.sku, sku))
          .limit(1);

        let productId: string;

        if (existingVariant) {
          productId = existingVariant.productId;
          const [existingProduct] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);

          // UPDATE Product (biztonságos merge: csak az EN-t írjuk felül, a HU/CZ marad)
          const nameJson = { 
            ...(existingProduct.name as Record<string, string>), 
            en: nameEn 
          };

          const longDescJson = { 
            ...(existingProduct.longDescription as Record<string, string>), 
            en: descEn 
          };
          
          // A shortDescription-t nem frissítjük többet!

          await tx.update(products).set({
            name: nameJson,
            longDescription: longDescJson,
            specifications: specifications,
            status: "ACTIVE", // Visszakapcsoljuk ha benne van a fájlban
            updatedAt: sql`now()`,
          }).where(eq(products.id, productId));

          // UPDATE Variant
          await tx.update(productVariants).set({
            priceHuf: priceHuf,
            priceEur: priceEur.toString(),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: row["Weight"] ? String(parseMeinlFloat(row["Weight"])) : null,
            width: row["Width"] ? String(parseMeinlFloat(row["Width"])) : null,
            height: row["Height"] ? String(parseMeinlFloat(row["Height"])) : null,
            depth: row["Depth"] ? String(parseMeinlFloat(row["Depth"])) : null,
          }).where(eq(productVariants.id, existingVariant.id));

          result.updated++;
        } else {
          // INSERT New Product
          const baseSlug = generateSlug(nameEn);
          const slugHu = await ensureUniqueSlug(baseSlug, "hu");
          const slugEn = await ensureUniqueSlug(baseSlug, "en");

          const [newProduct] = await tx.insert(products).values({
            type: MEINL_SYNC_CONFIG.PRODUCT_TYPE,
            name: { en: nameEn, hu: nameEn }, // Kezdetben HU is legyen EN ha új
            slug: { hu: slugHu, en: slugEn },
            longDescription: { en: descEn },
            // shortDescription-t üresen hagyjuk új terméknél is
            specifications: specifications,
            status: "ACTIVE",
          }).returning();

          productId = newProduct.id;

          await tx.insert(productVariants).values({
            productId: productId,
            sku: sku,
            priceHuf: priceHuf,
            priceEur: priceEur.toString(),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: row["Weight"] ? String(parseMeinlFloat(row["Weight"])) : null,
            width: row["Width"] ? String(parseMeinlFloat(row["Width"])) : null,
            height: row["Height"] ? String(parseMeinlFloat(row["Height"])) : null,
            depth: row["Depth"] ? String(parseMeinlFloat(row["Depth"])) : null,
          });

          result.inserted++;
        }

        // 4. Média szinkronizálás (Deduplikáció)
        const mediaUrlsRaw = String(row["Media URL"] || "");
        // Több URL esetén elválasztó lehet vessző vagy pontosvessző
        const mediaUrls = mediaUrlsRaw.split(/[;,]/).map(u => u.trim()).filter(u => u.startsWith("http"));

        for (let i = 0; i < mediaUrls.length; i++) {
          const url = mediaUrls[i];
          const [exists] = await tx
            .select()
            .from(productMedia)
            .where(and(eq(productMedia.productId, productId), eq(productMedia.url, url)))
            .limit(1);

          if (!exists) {
            await tx.insert(productMedia).values({
              productId: productId,
              url: url,
              type: "IMAGE", // Feltételezzük hogy kép
              order: i,
            });
          }
        }

        // 5. Kategória auto-matching (Név alapján)
        const categoryMatch = String(row["Category"] || row["Group"] || "").trim();
        if (categoryMatch) {
          const matchedCat = allCategories.find(c => {
            const names = (c.name || {}) as Record<string, string>;
            return Object.values(names).some(n => n.toLowerCase() === categoryMatch.toLowerCase());
          });

          if (matchedCat) {
            const [relExists] = await tx
              .select()
              .from(productCategories)
              .where(and(eq(productCategories.productId, productId), eq(productCategories.categoryId, matchedCat.id)))
              .limit(1);
            
            if (!relExists) {
              await tx.insert(productCategories).values({
                productId: productId,
                categoryId: matchedCat.id,
              });
            }
          }
        }
        
        result.successSkus.push(sku);
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const sku = String(row["Item"] || "Ismeretlen");
      result.errors.push(`Hiba a(z) ${sku} cikkszámnál: ${message}`);
      result.errorSkus.push({ sku, error: message });
    }
  }

  // 6. Deaktiválás
  const missingSkus = existingMeinlProducts.filter(p => !processedSkus.has(p.sku));
  if (missingSkus.length > 0) {
    const productIdsToDeactivate = [...new Set(missingSkus.map(p => p.productId))];
    await db
      .update(products)
      .set({ status: "INACTIVE" })
      .where(inArray(products.id, productIdsToDeactivate));
    result.deactivated = productIdsToDeactivate.length;
  }

  // 7. Mentés a sync_logs táblába
  await db.insert(syncLogs).values({
    syncType: "meinl",
    processedCount: result.processed,
    updatedCount: result.updated,
    insertedCount: result.inserted,
    deactivatedCount: result.deactivated,
    successSkus: result.successSkus,
    errorSkus: result.errorSkus,
    skippedSkus: result.skippedSkus,
  });

  return result;
}
