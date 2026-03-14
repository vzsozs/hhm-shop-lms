import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productAttachments, categories, syncLogs, productGroups } from "@/db/schema/shop";
import { eq, sql, and, inArray } from "drizzle-orm";
import * as XLSX from "xlsx";
import DOMPurify from "isomorphic-dompurify";
import { MEINL_SYNC_CONFIG } from "@/config/meinl-sync";

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
  "Item",
  "Related",
  "Product Name",
  "Product Description",
  "MSRP",
  "MSRP without VAT",
  "MSRP (gross)",
  "Purchase price",
  "Purchase price (net)",
  "Currency",
  "Stock",
  "Available",
  "Category",
  "Group",
  "Go Live Date",
  "Barcode",
  "Barcode Type",
  "HS Code",
  "Language",
  "Shipping Volume cbm",
  "Mastercarton Quantity",
  "Mastercarton Gross-Weight Kg",
  "Mastercarton Net-Weight Kg",
  "Mastercarton Volume cbm",
  "Mastercarton length cm",
  "Mastercarton width cm",
  "Mastercarton height cm",
  "Small Mastercarton Quantity",
  "Shipping Gross-Weight (per pc.) Kg",
  "Shipping Dimensions length cm",
  "Shipping Dimensions width cm",
  "Shipping Dimensions height cm",
  "Product Net-Weight Kg",
  "Product Dimensions length cm",
  "Product Dimensions width cm",
  "Product Dimensions height cm",
  "Image Thumbnail URL",
  "Image Main URL", // Ez maradhat a specben a kerni szerint
  "Image Detail URL",
  ...Array.from({ length: 19 }, (_, i) => `Image Detail URL${i + 2}`),
  "Video URL",
  "Video URL 1", "Video URL 2", "Video URL 3", "Video URL 4", "Video URL 5",
  "Video URL1", "Video URL2", "Video URL3", "Video URL4", "Video URL5",
  "Audio URL",
  "Document URL 1", "Document URL 2", "Document URL 3", "Document URL 4", "Document URL 5",
  "Document URL1", "Document URL2", "Document URL3", "Document URL4", "Document URL5",
  "Document URL",
  "Youtube Link 1", "Youtube Link 2", "Youtube Link 3",
  "Youtube Link1", "Youtube Link2", "Youtube Link3",
  "Youtube ID 1", "Youtube Embed Code 1", "Youtube ID 2", "Youtube Embed Code 2", "Youtube ID 3", "Youtube Embed Code 3",
  "Product group", "Product group2", "Product group3", "Product group4", "Product group5",
  "Media Folder", "Specs (all)", "Media URL",
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
  // Megszabadulunk a szóközöktől (ezres elválasztó) és a tizedesvesszőt pontra cseréljük
  // Fontos: a .toString() helyett String() a null/undefined miatt, de itt már szűrtük
  const str = String(value).trim()
    .replace(/\s/g, "") // Összes szóköz/whitespace eltávolítása (ezres elválasztó)
    .replace(",", "."); // Tizedesvessző tizedespontra cserélése
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
  groupAssignedCount: number;
  groupSkippedSkus: string[];
};

export async function syncMeinlData(fileBuffer: Buffer): Promise<SyncResult> {
  // UTF-8-SIG kezelése: az XLSX.read buffer-ből általában jól kezeli a BOM-ot.
  // UTF-8-SIG kezelése. A raw: true megakadályozza, hogy az XLSX automatikusan 
  // számként próbálja parszolni a mezőket, így a tizedesvessző megmarad stringként.
  const workbook = XLSX.read(fileBuffer, { type: "buffer", codepage: 65001, raw: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // raw: true kell, hogy ne próbálja meg kitalálni a típusokat (pl. ne vegye ki a tizedesvesszőt)
  const data = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as Record<string, unknown>[];

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

  if (data.length === 0) return result;

  // 1. Kategóriák betöltése a gyorsabb kereséshez
  const allCategories = await db.select().from(categories);
  
  // Gyűjtő a kapcsolódó termékekhez és csoportokhoz
  const relatedGroupsToProcess: { mainSku: string, relatedSkus: string[], groupName: string }[] = [];
  
  // 2. Eddigi Meinl termékek SKUi (deaktiváláshoz)
  // Mostantól a brand = 'Meinl' alapján azonosítjuk őket, mert a type = 'physical' lesz
  const existingMeinlProducts = await db
    .select({ sku: productVariants.sku, productId: products.id })
    .from(products)
    .innerJoin(productVariants, eq(products.id, productVariants.productId))
    .where(eq(products.brand, "Meinl"));
  
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

      const nameEn = String(row["Product Name"] || "").replace(/^MEINL Sonic Energy\s+/, "");
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

      // Ár számítás - MSRP without VAT és Purchase price (net) HUF-ban érkeznek!
      const priceHuf = Math.round(parseMeinlFloat(row["MSRP without VAT"]));
      const priceEur = priceHuf / MEINL_SYNC_CONFIG.EXCHANGE_RATE;

      // Súly és méretek átváltása (Kg -> g, cm -> mm)
      const weightG = Math.round(parseMeinlFloat(row["Product Net-Weight Kg"]) * 1000);
      const lengthMm = Math.round(parseMeinlFloat(row["Product Dimensions length cm"]) * 10);
      const widthMm = Math.round(parseMeinlFloat(row["Product Dimensions width cm"]) * 10);
      const heightMm = Math.round(parseMeinlFloat(row["Product Dimensions height cm"]) * 10);

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
        const key_sk = mapping ? mapping.sk : key;
        const val = String(value).trim();

        specifications.push({
          key_en,
          key_hu,
          key_sk,
          value_en: val,
          value_hu: val,
          value_sk: val,
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
            priceEur: priceEur.toFixed(2),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: weightG > 0 ? String(weightG) : null,
            width: widthMm > 0 ? String(widthMm) : null,
            height: heightMm > 0 ? String(heightMm) : null,
            depth: lengthMm > 0 ? String(lengthMm) : null,
          }).where(eq(productVariants.id, existingVariant.id));

          result.updated++;
        } else {
          // INSERT New Product
          const baseSlug = generateSlug(nameEn);
          const slugHu = await ensureUniqueSlug(baseSlug, "hu");
          const slugEn = await ensureUniqueSlug(baseSlug, "en");

          const [newProduct] = await tx.insert(products).values({
            type: "physical", // Mindig fizikai termék
            brand: "Meinl",
            name: { en: nameEn, hu: nameEn, sk: nameEn }, // Kezdetben HU és SK is legyen EN ha új
            slug: { hu: slugHu, en: slugEn, sk: slugEn },
            longDescription: { en: descEn, hu: "", sk: "" },
            // shortDescription-t üresen hagyjuk új terméknél is
            specifications: specifications,
            status: "ACTIVE",
          }).returning();

          productId = newProduct.id;

          await tx.insert(productVariants).values({
            productId: productId,
            sku: sku,
            priceHuf: priceHuf,
            priceEur: priceEur.toFixed(2),
            stock: Math.round(parseMeinlFloat(row["Stock"] || row["Available"] || "0")),
            weight: weightG > 0 ? String(weightG) : null,
            width: widthMm > 0 ? String(widthMm) : null,
            height: heightMm > 0 ? String(heightMm) : null,
            depth: lengthMm > 0 ? String(lengthMm) : null,
          });

          result.inserted++;
        }

        // 4. Média szinkronizálás (Deduplikáció)
        const mediaUrls: { url: string; type: "IMAGE" | "YOUTUBE" | "AUDIO" }[] = [];
        
        // Összes lehetséges képmező összegyűjtése
        const imageKeys = ["Image Thumbnail URL", "Image Detail URL", ...Array.from({ length: 19 }, (_, i) => `Image Detail URL${i + 2}`)];
        imageKeys.forEach(key => {
          const url = String(row[key] || "").trim();
          if (url.startsWith("http")) mediaUrls.push({ url, type: "IMAGE" as const });
        });

        // Audio gyűjtése
        const audioUrl = String(row["Audio URL"] || "").trim();
        if (audioUrl.startsWith("http")) mediaUrls.push({ url: audioUrl, type: "AUDIO" as const });

        // Youtube gyűjtése
        const ytKeys = ["Youtube Link 1", "Youtube Link 2", "Youtube Link 3", "Youtube Link1", "Youtube Link2", "Youtube Link3"];
        ytKeys.forEach(key => {
          const url = String(row[key] || "").trim();
          if (url.startsWith("http")) mediaUrls.push({ url, type: "YOUTUBE" as const });
        });

        // Video URL gyűjtése (ha Youtube, akkor YOUTUBE, egyébként IMAGE/VIDEO fallback)
        const videoKeys = ["Video URL 1", "Video URL 2", "Video URL 3", "Video URL 4", "Video URL 5", "Video URL1", "Video URL2", "Video URL3", "Video URL4", "Video URL5"];
        videoKeys.forEach(key => {
          const url = String(row[key] || "").trim();
          if (url.startsWith("http")) {
            const isYT = url.includes("youtube.com") || url.includes("youtu.be");
            mediaUrls.push({ url, type: isYT ? ("YOUTUBE" as const) : ("IMAGE" as const) });
          }
        });

        // Régi "Media URL" mező splitelése (ha még létezne)
        const legacyMedia = String(row["Media URL"] || "").split(/[;,]/).map(u => u.trim()).filter(u => u.startsWith("http"));
        legacyMedia.forEach(url => mediaUrls.push({ url, type: "IMAGE" as const }));

        // Egyedi média elemek (URL alapján deduplikálva, típust megőrizve)
        const uniqueMedia = Array.from(new Map(mediaUrls.map(m => [m.url, m])).values());

        for (let i = 0; i < uniqueMedia.length; i++) {
          const media = uniqueMedia[i];
          const [exists] = await tx
            .select()
            .from(productMedia)
            .where(and(eq(productMedia.productId, productId), eq(productMedia.url, media.url)))
            .limit(1);

          if (!exists) {
            await tx.insert(productMedia).values({
              productId: productId,
              url: media.url,
              type: media.type,
              order: i,
            });
          }
        }

        // 5. Dokumentumok (Attachments) szinkronizálása
        const docKeys = ["Document URL 1", "Document URL 2", "Document URL 3", "Document URL 4", "Document URL 5", "Document URL1", "Document URL2", "Document URL3", "Document URL4", "Document URL5"];
        const docUrls: string[] = [];
        docKeys.forEach(key => {
          const url = String(row[key] || "").trim();
          if (url.startsWith("http")) docUrls.push(url);
        });

        for (const url of [...new Set(docUrls)]) {
          const [exists] = await tx.select().from(productAttachments).where(and(eq(productAttachments.productId, productId), eq(productAttachments.url, url))).limit(1);
          if (!exists) {
            // Név kinyerése az URL-ből vagy header-ből
            const filename = url.split('/').pop() || "Dokumentum";
            await tx.insert(productAttachments).values({
              productId: productId,
              url: url,
              name: filename,
            });
          }
        }

        // 6. Hierarchikus kategória-kezelés (Product group -> Product group5)
        const categoryGroupKeys = ["Product group", "Product group2", "Product group3", "Product group4", "Product group5"];
        let lastParentId: string | null = null;
        const linkedCategoryIds: string[] = [];

        for (const key of categoryGroupKeys) {
          const catName = String(row[key] || "").trim();
          if (!catName) break; // Ha üres, megállunk a hierarchiában

          // Keressük meg vagy hozzuk létre a kategóriát ezen a szinten
          // Frissítjük a lokális listát is tranzakción belül ha szükséges
          let matchedCat = allCategories.find(c => {
            const names = (c.name || {}) as Record<string, string>;
            return (names.hu === catName || names.en === catName) && (c.parentId === lastParentId);
          });

          if (!matchedCat) {
            const baseSlug = generateSlug(catName);
            const slugHu = await ensureUniqueSlug(baseSlug, "hu");
            const slugEn = await ensureUniqueSlug(baseSlug, "en");

            const [newCat] = (await tx.insert(categories).values({
              name: { hu: catName, en: catName, sk: catName },
              slug: { hu: slugHu, en: slugEn, sk: slugEn },
              parentId: lastParentId,
            }).returning()) as (typeof categories.$inferSelect)[];

            matchedCat = newCat;
            allCategories.push(newCat); // Hozzáadjuk a lokális listához a köv. sorokhoz
          }

          if (matchedCat) {
            lastParentId = matchedCat.id;
            linkedCategoryIds.push(matchedCat.id);
          }
        }

        // Összekötés a termékkel (minden szinten)
        for (const catId of linkedCategoryIds) {
          const [relExists] = await tx
            .select()
            .from(productCategories)
            .where(and(eq(productCategories.productId, productId), eq(productCategories.categoryId, catId)))
            .limit(1);
          
          if (!relExists) {
            await tx.insert(productCategories).values({
              productId: productId,
              categoryId: catId,
            });
          }
        }
        
        
        result.successSkus.push(sku);

        // 7. Rokon termékek és csoportadatok kigyűjtése a post-processinghez
        const relatedStr = String(row["Related"] || "").trim();
        const relatedSkus = relatedStr ? relatedStr.split(',').map(s => s.trim()).filter(Boolean) : [];
        
        if (relatedSkus.length > 0) {
          // Csoport név meghatározása fallback-el
          const groupName = 
            String(row["Product group5"] || "").trim() ||
            String(row["Product group4"] || "").trim() ||
            String(row["Product group3"] || "").trim() ||
            String(row["Product group2"] || "").trim() ||
            String(row["Product group"] || "").trim() ||
            "Meinl Series";

          relatedGroupsToProcess.push({
            mainSku: sku,
            relatedSkus,
            groupName
          });
        }
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

  // 7. Post-processing: Rokon termékek csoportba rendezése
  if (relatedGroupsToProcess.length > 0) {
    try {
      // Összes érintett SKU kigyűjtése
      const allSkusToMap = new Set<string>();
      relatedGroupsToProcess.forEach(g => {
        allSkusToMap.add(g.mainSku);
        g.relatedSkus.forEach(s => allSkusToMap.add(s));
      });

      const skuArray = Array.from(allSkusToMap);
      
      // SKU -> { productId, groupId } Map építése
      const productMap = new Map<string, { id: string, groupId: string | null }>();
      const batchSize = 100;
      for (let i = 0; i < skuArray.length; i += batchSize) {
        const batch = skuArray.slice(i, i + batchSize);
        const productsInfo = await db
          .select({ 
            sku: productVariants.sku, 
            id: products.id, 
            groupId: products.groupId 
          })
          .from(products)
          .innerJoin(productVariants, eq(products.id, productVariants.productId))
          .where(inArray(productVariants.sku, batch));
        
        productsInfo.forEach(p => {
          productMap.set(p.sku, { id: p.id, groupId: p.groupId });
        });
      }

      // Csoportok betöltése a memóriába
      const activeProductGroups = await db.select().from(productGroups);

      // Csoportok feldolgozása
      for (const groupReq of relatedGroupsToProcess) {
        let group = activeProductGroups.find(g => {
          const names = (g.name || {}) as Record<string, string>;
          return names.hu === groupReq.groupName || names.en === groupReq.groupName;
        });

        // Ha nincs ilyen csoport, hozzuk létre
        if (!group) {
          const slug = generateSlug(groupReq.groupName);
          const [newGroup] = await db.insert(productGroups).values({
            name: { hu: groupReq.groupName, en: groupReq.groupName, sk: "" },
            slug: { hu: slug, en: slug, sk: "" },
          }).returning();
          
          group = newGroup;
          activeProductGroups.push(newGroup);
        }

        const groupId = group.id;
        const toUpdateIds: string[] = [];

        // Main SKU és Related SKUs ellenőrzése
        const allSkusInThisGroup = [groupReq.mainSku, ...groupReq.relatedSkus];
        
        for (const sku of allSkusInThisGroup) {
          const info = productMap.get(sku);
          if (info) {
            if (info.groupId === null) {
              toUpdateIds.push(info.id);
            } else if (info.groupId !== groupId) {
              // Ha már van csoportja és az NEM ez, akkor kihagyjuk
              if (!result.groupSkippedSkus.includes(sku)) {
                result.groupSkippedSkus.push(sku);
              }
            }
          }
        }

        // Batch update ha vannak frissítendő termékek
        if (toUpdateIds.length > 0) {
          await db.update(products)
            .set({ groupId })
            .where(inArray(products.id, toUpdateIds));
          
          result.groupAssignedCount += toUpdateIds.length;
          
          // Lokálisan is frissítsük a Map-et, hogy ne próbáljuk újra frissíteni ha másik sorban is szerepel
          toUpdateIds.forEach(id => {
            for (const [, info] of productMap.entries()) {
              if (info.id === id) {
                info.groupId = groupId;
              }
            }
          });
        }
      }
    } catch (postErr) {
      console.error("Hiba a csoportok post-processingje során:", postErr);
      result.errors.push(`Hiba a csoportok feldolgozásakor: ${postErr instanceof Error ? postErr.message : String(postErr)}`);
    }
  }

  // 8. Mentés a sync_logs táblába
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
