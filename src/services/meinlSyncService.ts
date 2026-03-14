import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productAttachments, categories, syncLogs, productGroups } from "@/db/schema/shop";
import { eq, sql, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";
import DOMPurify from "isomorphic-dompurify";
import { MEINL_SYNC_CONFIG } from "@/config/meinl-sync";
import chunk from "lodash.chunk";

type InsertProduct = typeof products.$inferInsert;
type InsertProductVariant = typeof productVariants.$inferInsert;
type InsertProductMedia = typeof productMedia.$inferInsert;
type InsertProductAttachment = typeof productAttachments.$inferInsert;
type InsertProductCategory = typeof productCategories.$inferInsert;
type InsertCategory = typeof categories.$inferInsert;

const SPEC_MAPPING: Record<string, { en: string; hu: string; sk: string }> = {
  "Material": { en: "Material", hu: "Anyag", sk: "Materiál" },
  "Brand": { en: "Brand", hu: "Márka", sk: "Značka" },
  "Color": { en: "Color", hu: "Szín", sk: "Farba" },
  "Size": { en: "Size", hu: "Méret", sk: "Veľkosť" },
  "Chakra": { en: "Chakra", hu: "Csakra", sk: "Čakra" },
  "Tuning": { en: "Tuning", hu: "Hangolás", sk: "Ladenie" },
  "Diameter": { en: "Diameter", hu: "Átmérő", sk: "Priemer" },
  "Strings": { en: "Strings", hu: "Húrok száma", sk: "Počet strún" },
  "Origin": { en: "Origin", hu: "Származás", sk: "Pôvod" },
  "Country of Origin": { en: "Country of Origin", hu: "Származási hely", sk: "Krajina pôvodu" },
  "Length": { en: "Length", hu: "Hosszúság", sk: "Dĺžka" },
  "Finish": { en: "Finish", hu: "Kivitel", sk: "Povrchová úprava" },
  "Inclusive": { en: "Inclusive", hu: "Tartalmaz", sk: "Obsahuje" },
  "Made in": { en: "Made in", hu: "Származási hely", sk: "Vyrobené v" },
  "Note/Tuning": { en: "Note/Tuning", hu: "Megjegyzés/Hangolás", sk: "Poznámka/Ladenie" },
  "Weight": { en: "Weight", hu: "Súlya", sk: "Hmotnosť" },
  "Height": { en: "Height", hu: "Magasság", sk: "Výška" },
  "Width": { en: "Width", hu: "Szélesség", sk: "Šírka" },
  "Depth": { en: "Depth", hu: "Mélység", sk: "Hĺbka" },
  "Top": { en: "Top", hu: "Teteje", sk: "Vrchná časť" },
  "Including": { en: "Including", hu: "Tartalmaz", sk: "Vrátane" },
  "Speification": { en: "Specification", hu: "Specifikáció", sk: "Špecifikácia" },
};

const SPEC_EXCLUDE = [
  "Item", "Related", "Product Name", "Product Description", "MSRP", "MSRP without VAT", "MSRP (gross)",
  "Purchase price", "Purchase price (net)", "Currency", "Stock", "Available", "Category", "Group",
  "Go Live Date", "Barcode", "Barcode Type", "HS Code", "Language", "Shipping Volume cbm",
  "Mastercarton Quantity", "Mastercarton Gross-Weight Kg", "Mastercarton Net-Weight Kg", "Mastercarton Volume cbm",
  "Mastercarton length cm", "Mastercarton width cm", "Mastercarton height cm", "Small Mastercarton Quantity",
  "Shipping Gross-Weight (per pc.) Kg", "Shipping Dimensions length cm", "Shipping Dimensions width cm", "Shipping Dimensions height cm",
  "Product Net-Weight Kg", "Product Dimensions length cm", "Product Dimensions width cm", "Product Dimensions height cm",
  "Image Thumbnail URL", "Image Main URL", "Image Detail URL",
  ...Array.from({ length: 19 }, (_, i) => `Image Detail URL${i + 2}`),
  "Video URL", "Video URL 1", "Video URL 2", "Video URL 3", "Video URL 4", "Video URL 5",
  "Video URL1", "Video URL2", "Video URL3", "Video URL4", "Video URL5",
  "Audio URL", "Document URL 1", "Document URL 2", "Document URL 3", "Document URL 4", "Document URL 5",
  "Document URL1", "Document URL2", "Document URL3", "Document URL4", "Document URL5", "Document URL",
  "Youtube Link 1", "Youtube Link 2", "Youtube Link 3", "Youtube Link1", "Youtube Link2", "Youtube Link3",
  "Youtube ID 1", "Youtube Embed Code 1", "Youtube ID 2", "Youtube Embed Code 2", "Youtube ID 3", "Youtube Embed Code 3",
  "Product group", "Product group2", "Product group3", "Product group4", "Product group5",
  "Media Folder", "Specs (all)", "Media URL",
  "Feature 1", "Feature 2", "Feature 3", "Feature 4", "Feature 5", "Feature 6", "Feature 7", "Feature 8", "Feature 9", "Feature 10",
  "Feature1", "Feature2", "Feature3", "Feature4", "Feature5", "Feature6", "Feature7", "Feature8", "Feature9", "Feature10",
];

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
  const str = String(value).trim().replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
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
  groupAssignedCount: number;
  groupSkippedSkus: string[];
};

export async function syncMeinlData(fileBuffer: Buffer): Promise<SyncResult> {
  const result: SyncResult = {
    processed: 0,
    updated: 0,
    inserted: 0,
    deactivated: 0,
    errors: [],
    successSkus: [],
    errorSkus: [],
    skippedSkus: [],
    groupAssignedCount: 0,
    groupSkippedSkus: [],
  };

  const workbook = XLSX.read(fileBuffer, { type: "buffer", codepage: 65001, raw: true });
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: true }) as Record<string, unknown>[];

  if (data.length === 0) return result;

  // 1. Pre-load db data into memory
  const allCategories = await db.select().from(categories);
  const activeProductGroups = await db.select().from(productGroups);
  const existingMeinlProducts = await db
    .select({ sku: productVariants.sku, productId: products.id, name: products.name, longDescription: products.longDescription, status: products.status, groupId: products.groupId })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(eq(products.brand, "Meinl"));

  const existingVariantsMap = new Map<string, { productId: string; name: unknown; longDescription: unknown; status: string; groupId: string | null }>();
  for (const p of existingMeinlProducts) {
    if (p.sku) existingVariantsMap.set(p.sku, p);
  }

  // To batch new inserts
  const newProductsToInsert: { productId: string, productData: InsertProduct, variantData: InsertProductVariant }[] = [];
  const updatedProductsToSave: { productId: string, productUpdate: Partial<InsertProduct>, variantUpdate: Partial<InsertProductVariant> }[] = [];
  const relatedGroupsToProcess: { mainSku: string, relatedSkus: string[], groupName: string }[] = [];
  
  // Data for media, categories, attachments
  const mediaToInsert: InsertProductMedia[] = [];
  const attachmentsToInsert: InsertProductAttachment[] = [];
  const productCategoriesToInsert: InsertProductCategory[] = [];
  const dbCategoriesToInsert = new Map<string, InsertCategory>(); // key is slugHu
  
  const processedSkus = new Set<string>();

  // A shared set of reserved slugs to handle uniqueness locally during the sync
  const localSlugSet = new Set<string>();
  
  // Load existing slugs into memory to avoid DB queries per product
  const existingSlugs = await db.select({ slugHu: sql`slug->>'hu'` }).from(products);
  for (const s of existingSlugs) {
    if (s.slugHu) localSlugSet.add(s.slugHu as string);
  }

  const ensureUniqueLocalSlug = (baseSlug: string) => {
    if (!localSlugSet.has(baseSlug)) {
      localSlugSet.add(baseSlug);
      return baseSlug;
    }
    let counter = 2;
    while (localSlugSet.has(`${baseSlug}-${counter}`)) {
      counter++;
    }
    const finalSlug = `${baseSlug}-${counter}`;
    localSlugSet.add(finalSlug);
    return finalSlug;
  };

  // We assign temporary IDs strings to new products to build relations locally before DB insertion.
  // We'll replace them with real UUIDs later using crypto.randomUUID().
  
  for (const row of data) {
    try {
      const sku = String(row["Item"] || "").trim();
      if (!sku) {
        result.skippedSkus.push("N/A (Hiányzó cikkszám)");
        continue;
      }

      processedSkus.add(sku);
      result.processed++;

      const cleanHTML = (html: string) => DOMPurify.sanitize(html || "", { ALLOWED_TAGS: ["p", "ul", "li", "br", "strong", "b", "i", "em"], ALLOWED_ATTR: [] });
      const nameEn = String(row["Product Name"] || "").replace(/^MEINL Sonic Energy\s+/, "");
      const descEn = cleanHTML(String(row["Product Description"] || ""));

      let shortDescHtml = "<ul>";
      for (let i = 1; i <= 10; i++) {
        const usp = row[`USP ${i}`] || row[`USP${i}`];
        const feat = row[`Feature ${i}`] || row[`Feature${i}`];
        if (usp) shortDescHtml += `<li>${DOMPurify.sanitize(String(usp))}</li>`;
        if (feat) shortDescHtml += `<li>${DOMPurify.sanitize(String(feat))}</li>`;
      }
      shortDescHtml += "</ul>";
      if (shortDescHtml === "<ul></ul>") shortDescHtml = "";

      const priceHuf = Math.round(parseMeinlFloat(row["MSRP without VAT"]));
      const priceEur = priceHuf / MEINL_SYNC_CONFIG.EXCHANGE_RATE;
      const weightG = Math.round(parseMeinlFloat(row["Product Net-Weight Kg"]) * 1000);
      const lengthMm = Math.round(parseMeinlFloat(row["Product Dimensions length cm"]) * 10);
      const widthMm = Math.round(parseMeinlFloat(row["Product Dimensions width cm"]) * 10);
      const heightMm = Math.round(parseMeinlFloat(row["Product Dimensions height cm"]) * 10);

      const specifications: { key_en: string; key_hu: string; value_en: string; value_hu: string; key_sk: string; value_sk: string }[] = [];
      Object.keys(row).forEach((key) => {
        const value = row[key];
        if (value === null || value === undefined || value === "" || SPEC_EXCLUDE.includes(key)) return;
        const mapping = SPEC_MAPPING[key];
        const key_en = mapping ? mapping.en : key;
        const key_hu = mapping ? mapping.hu : key;
        const key_sk = mapping ? mapping.sk : key;
        const val = String(value).trim();
        specifications.push({ key_en, key_hu, key_sk, value_en: val, value_hu: val, value_sk: val });
      });

      const existingRecord = existingVariantsMap.get(sku);
      
      const productId = existingRecord ? existingRecord.productId : crypto.randomUUID();

      if (existingRecord) {
        // Prepare update
        const nameJson = { ...(existingRecord.name as Record<string, string>), en: nameEn };
        const longDescJson = { ...(existingRecord.longDescription as Record<string, string>), en: descEn };

        updatedProductsToSave.push({
          productId,
          productUpdate: {
            id: productId,
            name: nameJson,
            longDescription: longDescJson,
            specifications: specifications,
            status: "ACTIVE",
            updatedAt: new Date()
          },
          variantUpdate: {
            productId,
            sku,
            priceHuf,
            priceEur: priceEur.toFixed(2),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: weightG > 0 ? String(weightG) : null,
            width: widthMm > 0 ? String(widthMm) : null,
            height: heightMm > 0 ? String(heightMm) : null,
            depth: lengthMm > 0 ? String(lengthMm) : null,
          }
        });
        result.updated++;
      } else {
        // Prepare insert
        const baseSlug = generateSlug(nameEn);
        const slugHu = ensureUniqueLocalSlug(baseSlug);
        const slugEn = ensureUniqueLocalSlug(baseSlug);

        newProductsToInsert.push({
          productId,
          productData: {
            id: productId,
            type: "physical",
            brand: "Meinl",
            name: { en: nameEn, hu: nameEn, sk: nameEn },
            slug: { hu: slugHu, en: slugEn, sk: slugEn },
            longDescription: { en: descEn, hu: "", sk: "" },
            specifications: specifications,
            status: "ACTIVE",
          },
          variantData: {
            productId,
            sku,
            priceHuf,
            priceEur: priceEur.toFixed(2),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: weightG > 0 ? String(weightG) : null,
            width: widthMm > 0 ? String(widthMm) : null,
            height: heightMm > 0 ? String(heightMm) : null,
            depth: lengthMm > 0 ? String(lengthMm) : null,
          }
        });
        result.inserted++;
      }

      // Collect Media URLs
      const mediaUrls: { url: string; type: "IMAGE" | "YOUTUBE" | "AUDIO" }[] = [];
      const imageKeys = ["Image Thumbnail URL", "Image Detail URL", ...Array.from({ length: 19 }, (_, i) => `Image Detail URL${i + 2}`)];
      imageKeys.forEach(key => {
        const url = String(row[key] || "").trim();
        if (url.startsWith("http")) mediaUrls.push({ url, type: "IMAGE" as const });
      });

      const audioUrl = String(row["Audio URL"] || "").trim();
      if (audioUrl.startsWith("http")) mediaUrls.push({ url: audioUrl, type: "AUDIO" as const });

      const ytKeys = ["Youtube Link 1", "Youtube Link 2", "Youtube Link 3", "Youtube Link1", "Youtube Link2", "Youtube Link3"];
      ytKeys.forEach(key => {
        const url = String(row[key] || "").trim();
        if (url.startsWith("http")) mediaUrls.push({ url, type: "YOUTUBE" as const });
      });

      const videoKeys = ["Video URL 1", "Video URL 2", "Video URL 3", "Video URL 4", "Video URL 5", "Video URL1", "Video URL2", "Video URL3", "Video URL4", "Video URL5"];
      videoKeys.forEach(key => {
        const url = String(row[key] || "").trim();
        if (url.startsWith("http")) {
          const isYT = url.includes("youtube.com") || url.includes("youtu.be");
          mediaUrls.push({ url, type: isYT ? ("YOUTUBE" as const) : ("IMAGE" as const) });
        }
      });

      const uniqueMedia = Array.from(new Map(mediaUrls.map(m => [m.url, m])).values());
      for (let i = 0; i < uniqueMedia.length; i++) {
        mediaToInsert.push({
          productId,
          url: uniqueMedia[i].url,
          type: uniqueMedia[i].type,
          order: i,
        });
      }

      // Collect Document URLs
      const docKeys = ["Document URL 1", "Document URL 2", "Document URL 3", "Document URL 4", "Document URL 5", "Document URL1", "Document URL2", "Document URL3", "Document URL4", "Document URL5"];
      const docUrls: string[] = [];
      docKeys.forEach(key => {
        const url = String(row[key] || "").trim();
        if (url.startsWith("http")) docUrls.push(url);
      });

      for (const url of [...new Set(docUrls)]) {
        attachmentsToInsert.push({
          productId,
          url: url,
          name: url.split('/').pop() || "Dokumentum",
        });
      }

      // Collect Categories
      const categoryGroupKeys = ["Product group", "Product group2", "Product group3", "Product group4", "Product group5"];
      let lastParentId: string | null = null;
      
      for (const key of categoryGroupKeys) {
        const catName = String(row[key] || "").trim();
        if (!catName) break;
        
        let matchedCat = allCategories.find(c => {
          const names = (c.name || {}) as Record<string, string>;
          return (names.hu === catName || names.en === catName) && (c.parentId === lastParentId);
        });

        if (!matchedCat) {
          // check if we created it locally in this sync run
          const slugHu = ensureUniqueLocalSlug(generateSlug(catName));
          const localCat = dbCategoriesToInsert.get(slugHu);
          
          if (localCat) {
             matchedCat = localCat as typeof allCategories[0];
          } else {
             const newCatId = crypto.randomUUID();
             const newCat: InsertCategory = {
               id: newCatId,
               name: { hu: catName, en: catName, sk: catName },
               description: null,
               slug: { hu: slugHu, en: slugHu, sk: slugHu },
               parentId: lastParentId || null,
             };
             dbCategoriesToInsert.set(slugHu, newCat);
             allCategories.push(newCat as typeof allCategories[0]);
             matchedCat = newCat as typeof allCategories[0];
          }
        }

        if (matchedCat) {
          lastParentId = matchedCat.id;
          productCategoriesToInsert.push({ productId, categoryId: matchedCat.id });
        }
      }

      result.successSkus.push(sku);

      // Group processing
      const relatedStr = String(row["Related"] || "").trim();
      const relatedSkus = relatedStr ? relatedStr.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (relatedSkus.length > 0) {
        const groupName = 
          String(row["Product group5"] || "").trim() ||
          String(row["Product group4"] || "").trim() ||
          String(row["Product group3"] || "").trim() ||
          String(row["Product group2"] || "").trim() ||
          String(row["Product group"] || "").trim() ||
          "Meinl Series";

        relatedGroupsToProcess.push({ mainSku: sku, relatedSkus, groupName });
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const sku = String(row["Item"] || "Ismeretlen");
      result.errors.push(`Hiba a(z) ${sku} cikkszámnál: ${message}`);
      result.errorSkus.push({ sku, error: message });
    }
  }

  // --- DB Operations (Batched) ---
  await db.transaction(async (tx) => {
    // 1. Insert new categories if any
    if (dbCategoriesToInsert.size > 0) {
       const catsToInsert = Array.from(dbCategoriesToInsert.values());
       await tx.insert(categories).values(catsToInsert);
    }
    
    // 2. Insert New Products and Variants
    if (newProductsToInsert.length > 0) {
      const pChunks = chunk(newProductsToInsert.map(p => p.productData), 500);
      for (const p of pChunks) await tx.insert(products).values(p);
      
      const vChunks = chunk(newProductsToInsert.map(p => p.variantData), 500);
      for (const v of vChunks) await tx.insert(productVariants).values(v);
    }

    // 3. Update existing Products and Variants safely
    // Since SQL bulk updates are complex and error-prone, we'll iterate with individual updates 
    // but without any SELECTs inside the loop, heavily reducing DB latency.
    for (const u of updatedProductsToSave) {
      await tx.update(products).set(u.productUpdate).where(eq(products.id, u.productId));
      await tx.update(productVariants).set(u.variantUpdate).where(eq(productVariants.productId, u.productId));
    }

    // 4. Overwrite Media
    // To simplify: we delete existing media for processed products and bulk insert the new media.
    const allProcessedProductIds = [
       ...newProductsToInsert.map(p => p.productId),
       ...updatedProductsToSave.map(p => p.productId)
    ];
    
    if (allProcessedProductIds.length > 0) {
      const idChunks = chunk(allProcessedProductIds, 500);
      for (const ids of idChunks) {
         await tx.delete(productMedia).where(inArray(productMedia.productId, ids));
         await tx.delete(productAttachments).where(inArray(productAttachments.productId, ids));
      }
    }

    if (mediaToInsert.length > 0) {
       // Deduplicate globally due to map overhead
       const uniqueMediaMap = new Map();
       for(const m of mediaToInsert) {
           uniqueMediaMap.set(`${m.productId}-${m.url}`, m);
       }
       const mediaChunks = chunk(Array.from(uniqueMediaMap.values()), 500);
       for (const m of mediaChunks) await tx.insert(productMedia).values(m);
    }
    
    if (attachmentsToInsert.length > 0) {
       const uniqueAttMap = new Map();
       for(const a of attachmentsToInsert) {
           uniqueAttMap.set(`${a.productId}-${a.url}`, a);
       }
       const attChunks = chunk(Array.from(uniqueAttMap.values()), 500);
       for (const a of attChunks) await tx.insert(productAttachments).values(a);
    }

    // 5. Build Category Links using onConflictDoNothing (PostgreSQL) 
    // Workaround for Drizzle constraint gaps: delete existing mappings for affected products and insert to be safe.
    if (allProcessedProductIds.length > 0) {
      const idChunks = chunk(allProcessedProductIds, 500);
      for (const ids of idChunks) {
         await tx.delete(productCategories).where(inArray(productCategories.productId, ids));
      }
    }
    if (productCategoriesToInsert.length > 0) {
       const uniqueRelMap = new Map();
       for(const c of productCategoriesToInsert) {
           uniqueRelMap.set(`${c.productId}-${c.categoryId}`, c);
       }
       const catChunks = chunk(Array.from(uniqueRelMap.values()), 500);
       for (const c of catChunks) await tx.insert(productCategories).values(c);
    }

    // 6. Deactivate missing Meinl Products
    const missingSkus = existingMeinlProducts.filter(p => !processedSkus.has(p.sku));
    if (missingSkus.length > 0) {
      const productIdsToDeactivate = [...new Set(missingSkus.map(p => p.productId))];
      await tx.update(products).set({ status: "INACTIVE" }).where(inArray(products.id, productIdsToDeactivate));
      result.deactivated = productIdsToDeactivate.length;
    }
    
    // 7. Group Processing
    if (relatedGroupsToProcess.length > 0) {
      try {
        const allSkusToMap = new Set<string>();
        relatedGroupsToProcess.forEach(g => {
          allSkusToMap.add(g.mainSku);
          g.relatedSkus.forEach(s => allSkusToMap.add(s));
        });

        const productMap = new Map<string, { id: string, groupId: string | null }>();
        
        // Merging already known IDs from insert/update arrays instead of querying the DB again!
        for (const p of updatedProductsToSave) {
           const sku = p.variantUpdate.sku || "";
           const groupId = existingVariantsMap.get(sku)?.groupId || null;
           productMap.set(sku, { id: p.productId, groupId });
        }
        for (const p of newProductsToInsert) {
           productMap.set(p.variantData.sku || "", { id: p.productId, groupId: null });
        }

        for (const groupReq of relatedGroupsToProcess) {
          let group = activeProductGroups.find(g => {
            const names = (g.name || {}) as Record<string, string>;
            return names.hu === groupReq.groupName || names.en === groupReq.groupName;
          });

          if (!group) {
            const slug = ensureUniqueLocalSlug(generateSlug(groupReq.groupName));
            const [newGroup] = await tx.insert(productGroups).values({
              name: { hu: groupReq.groupName, en: groupReq.groupName, sk: "" },
              slug: { hu: slug, en: slug, sk: "" },
            }).returning();
            group = newGroup;
            activeProductGroups.push(newGroup);
          }

          const groupId = group.id;
          const toUpdateIds: string[] = [];
          const allSkusInThisGroup = [groupReq.mainSku, ...groupReq.relatedSkus];
          
          for (const sku of allSkusInThisGroup) {
            const info = productMap.get(sku);
            if (info) {
              if (info.groupId === null) {
                if (info.id) {
                    toUpdateIds.push(info.id);
                }
                info.groupId = groupId; // update local map
              } else if (info.groupId !== groupId) {
                if (!result.groupSkippedSkus.includes(sku)) {
                  result.groupSkippedSkus.push(sku);
                }
              }
            }
          }

          if (toUpdateIds.length > 0) {
            const idChunks = chunk(toUpdateIds, 500);
            for(const ids of idChunks) {
              await tx.update(products).set({ groupId }).where(inArray(products.id, ids));
            }
            result.groupAssignedCount += toUpdateIds.length;
          }
        }
      } catch (postErr) {
        console.error("Hiba a csoportok post-processingje során:", postErr);
        result.errors.push(`Hiba a csoportok feldolgozásakor: ${postErr instanceof Error ? postErr.message : String(postErr)}`);
      }
    }
  });

  // 8. Mentés a sync_logs táblába (Transaction kívül, hogy ha hiba volt, legalább a log felmenjen ha lehet - wait, actually just inside or after successfully done)
  await db.insert(syncLogs).values({
    syncType: "meinl",
    processedCount: result.processed,
    updatedCount: result.updated,
    insertedCount: result.inserted,
    deactivatedCount: result.deactivated,
    successSkus: result.successSkus,
    errorSkus: result.errorSkus,
    skippedSkus: result.skippedSkus,
    groupAssignedCount: result.groupAssignedCount,
    groupSkippedSkus: result.groupSkippedSkus,
  });

  return result;
}
