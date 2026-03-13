import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, categories, productRecommendations, productAttachments, productGroups, badgeSettings } from "@/db/schema";
import { eq, and, sql, inArray, asc, desc } from "drizzle-orm";

export type ProductListFilters = {
  search?: string;
  type?: "physical" | "digital";
  categoryId?: string;
  sort?: string;
};

// Visszaérkező típus a UI-hoz
export type ProductListItem = {
  id: string;
  slug: Record<string, string>; // SEO-barát URL azonosító
  name: Record<string, string>; // JSONB többnyelvű név { hu: string, en: string, ... }
  description: Record<string, string> | null;
  shortDescription: Record<string, string> | null;
  type: "physical" | "digital";
  minPriceHuf: number | null;
  minPriceEur: number | null;
  mainImageUrl: string | null;
  specifications: Record<string, unknown> | null;
  categories: { id: string; name: Record<string, string>; slug: Record<string, string> }[];
  badges: { icon: string; tooltip: Record<string, string> }[];
};

export async function getActiveProducts(filters?: ProductListFilters): Promise<ProductListItem[]> {
  // A keresési és szűrési feltételek tömbje
  const conditions = [];

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      sql`${products.name}->>'hu' ILIKE ${term} OR ${products.name}->>'en' ILIKE ${term} OR ${products.name}->>'sk' ILIKE ${term}`
    );
  }

  if (filters?.type) {
    conditions.push(eq(products.type, filters.type));
  }

  if (filters?.categoryId) {
    const categoryProductsSq = db
      .select({ productId: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, filters.categoryId));
      
    conditions.push(inArray(products.id, categoryProductsSq));
  }

  // Alap lekérdezés + Feltételek
  let baseQuery = db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      description: products.description,
      shortDescription: products.shortDescription,
      type: products.type,
      minPriceHuf: sql<number>`min(${productVariants.priceHuf})`.mapWith(Number),
      minPriceEur: sql<number>`min(${productVariants.priceEur})`.mapWith(Number),
      mainImageUrl: sql<string>`(
        SELECT url
        FROM product_media
        WHERE product_id = ${products.id}
        AND type = 'IMAGE'
        ORDER BY "order" ASC
        LIMIT 1
      )`,
      specifications: products.specifications,
      badges: products.badges,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId));

  if (conditions.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let groupedQuery = baseQuery.groupBy(products.id) as any;

  if (filters?.sort) {
    switch (filters.sort) {
      case "price-asc":
        groupedQuery = groupedQuery.orderBy(asc(sql`min(${productVariants.priceHuf})`));
        break;
      case "price-desc":
        groupedQuery = groupedQuery.orderBy(desc(sql`min(${productVariants.priceHuf})`));
        break;
      case "name-asc":
        groupedQuery = groupedQuery.orderBy(asc(sql`${products.name}->>'hu'`));
        break;
      case "name-desc":
        groupedQuery = groupedQuery.orderBy(desc(sql`${products.name}->>'hu'`));
        break;
      case "newest":
      default:
        groupedQuery = groupedQuery.orderBy(desc(products.createdAt));
        break;
    }
  } else {
    groupedQuery = groupedQuery.orderBy(desc(products.createdAt));
  }

  const rawResults = await groupedQuery;

  // Most lekérjük az összes érintett termék kategóriáját Map-be
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productIds = rawResults.map((r: any) => r.id);
  const categoriesMap = new Map<string, { id: string; name: Record<string, string>; slug: string }[]>();

  if (productIds.length > 0) {
    const rawCategories = await db
      .select({
        productId: productCategories.productId,
        category: categories,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(inArray(productCategories.productId, productIds));

    for (const row of rawCategories) {
      const existing = categoriesMap.get(row.productId) || [];
      existing.push(row.category as unknown as { id: string; name: Record<string, string>; slug: string; });
      categoriesMap.set(row.productId, existing);
    }
  }

  // Lekérjük a badge beállításokat is
  const badgeSettingsData = await db.select().from(badgeSettings);
  const badgeSettingsMap = new Map<string, Record<string, string>>();
  badgeSettingsData.forEach((s) => {
    badgeSettingsMap.set(s.iconName, s.tooltips as Record<string, string>);
  });

  // Formázás és visszatérés
  return rawResults.map((r: any) => ({
    ...r,
    name: r.name as Record<string, string>,
    description: r.description as Record<string, string> | null,
    shortDescription: r.shortDescription as Record<string, string> | null,
    categories: categoriesMap.get(r.id) || [],
    badges: ((r.badges || []) as { icon: string }[])
      .filter(b => b && b.icon)
      .map(b => ({
        icon: b.icon,
        tooltip: badgeSettingsMap.get(b.icon) || { hu: "", en: "", sk: "" }
      })) as { icon: string; tooltip: Record<string, string> }[],
  }));
}

// Segédfüggvény a szűrő menü felépítéséhez
export async function getAllCategories() {
  const cats = await db.select().from(categories).orderBy(asc(categories.name));
  return cats.map(c => ({
    ...c,
    name: c.name as Record<string, string>,
    description: c.description as Record<string, string> | null,
    slug: c.slug as Record<string, string>,
  }));
}

// Segédfüggvény a termékajánlások listájához
export async function getAllProductsForSelect() {
  const allProds = await db.select({
    id: products.id,
    name: products.name,
  }).from(products).where(eq(products.status, 'ACTIVE'));
  
  return allProds.map(p => ({
    id: p.id,
    name: p.name as Record<string, string>,
  }));
}

// Összes termékcsalád a legördülő admin listához
export async function getAllProductGroups() {
  const groups = await db.select().from(productGroups).orderBy(productGroups.createdAt);
  return groups.map(g => ({
    id: g.id,
    name: g.name as Record<string, string>,
    slug: g.slug as Record<string, string>,
  }));
}

export type ProductVariantItem = {
  id: string;
  sku: string;
  priceHuf: number | null;
  priceEur: number | null;
  stock: number;
  weight: number | null;
  width: number | null;
  height: number | null;
  depth: number | null;
};

export type ProductMediaItem = {
  id: string;
  url: string;
  type: "IMAGE" | "YOUTUBE" | "AUDIO";
  order: number;
};

export type ProductDetailItem = {
  id: string;
  slug: Record<string, string>;
  name: Record<string, string>;
  description: Record<string, string> | null;
  shortDescription: Record<string, string> | null;
  longDescription: Record<string, string> | null;
  specifications: Record<string, unknown> | null;
  type: "physical" | "digital";
  variants: ProductVariantItem[];
  media: ProductMediaItem[];
  categories: { id: string; name: Record<string, string>; slug: Record<string, string> }[];
  recommendations?: string[];
  attachments?: { id: string; url: string; name: string }[];
  badges: { icon: string; tooltip: Record<string, string> }[];
  groupId: string | null;
  group?: { id: string; name: Record<string, string>; slug: Record<string, string> } | null;
  groupProducts?: { 
    id: string; 
    name: Record<string, string>; 
    slug: Record<string, string>; 
    shortDescription: Record<string, string> | null;
    mainImageUrl: string | null;
    badges: { icon: string; tooltip: Record<string, string> }[];
  }[];
};

// Termék lekérdezése slug alapján (publikus termékoldalhoz)
export async function getProductBySlug(slug: string): Promise<ProductDetailItem | null> {
  const [productData] = await db
    .select()
    .from(products)
    .where(sql`${products.slug}->>'hu' = ${slug} OR ${products.slug}->>'en' = ${slug} OR ${products.slug}->>'sk' = ${slug}`)
    .limit(1);

  if (!productData) {
    return null;
  }



  const results = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, productData.id)),
    db.select().from(productMedia).where(eq(productMedia.productId, productData.id)).orderBy(asc(productMedia.order)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, productData.id)),
    productData.groupId 
      ? db.select().from(productGroups).where(eq(productGroups.id, productData.groupId)).limit(1).then(r => r[0])
      : Promise.resolve(null),
    db.select().from(badgeSettings),
  ]);

  const [productVariantsData, productMediaData, productCategoriesData, groupData, badgeSettingsData] = results;
  const badgeSettingsMap = new Map<string, Record<string, string>>();
  badgeSettingsData.forEach((s) => {
    badgeSettingsMap.set(s.iconName, s.tooltips as Record<string, string>);
  });

  let groupProductsData: { 
    id: string; 
    name: Record<string, string>; 
    slug: Record<string, string>; 
    shortDescription: Record<string, string> | null;
    mainImageUrl: string | null;
    badges: { icon: string; tooltip: Record<string, string> }[];
  }[] = [];

  if (productData.groupId) {
    // Fetch group products and their first images using a Join
    const rawGroupData = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        shortDescription: products.shortDescription,
        mediaUrl: productMedia.url,
        mediaOrder: productMedia.order,
        badges: products.badges,
      })
      .from(products)
      .leftJoin(productMedia, and(eq(products.id, productMedia.productId), eq(productMedia.type, 'IMAGE')))
      .where(and(eq(products.groupId, productData.groupId), eq(products.status, 'ACTIVE')))
      .orderBy(asc(products.id), asc(productMedia.order));

    // Group by product id to take the first image for each
    const grouped = new Map<string, { 
      id: string; 
      name: Record<string, string>; 
      slug: Record<string, string>; 
      shortDescription: Record<string, string> | null;
      mainImageUrl: string | null;
      badges: { icon: string; tooltip: Record<string, string> }[];
    }>();
    for (const item of rawGroupData) {
      if (!grouped.has(item.id)) {
        grouped.set(item.id, {
          id: item.id,
          name: item.name as Record<string, string>,
          slug: item.slug as Record<string, string>,
          shortDescription: item.shortDescription as Record<string, string> | null,
          mainImageUrl: item.mediaUrl,
          badges: ((item.badges || []) as unknown[]).map(b => {
            if (typeof b === 'string') return { icon: b, tooltip: {} };
            const badge = b as { icon: string; tooltip: Record<string, string> };
            return { icon: badge.icon, tooltip: badge.tooltip || {} };
          }) as { icon: string; tooltip: Record<string, string> }[],
        });
      }
    }
    groupProductsData = Array.from(grouped.values());
  }

  return {
    id: productData.id,
    slug: productData.slug as Record<string, string>,
    name: productData.name as Record<string, string>,
    description: productData.description as Record<string, string> | null,
    shortDescription: productData.shortDescription as Record<string, string> | null,
    longDescription: productData.longDescription as Record<string, string> | null,
    specifications: productData.specifications as Record<string, unknown> | null,
    type: productData.type as "physical" | "digital",
    badges: ((productData.badges || []) as { icon: string }[])
      .filter(b => b && b.icon)
      .map(b => ({
        icon: b.icon,
        tooltip: badgeSettingsMap.get(b.icon) || { hu: "", en: "", sk: "" }
      })),
    variants: productVariantsData.map(v => ({
      id: v.id,
      sku: v.sku,
      priceHuf: v.priceHuf,
      priceEur: v.priceEur ? Number(v.priceEur) : null,
      stock: v.stock,
      weight: v.weight ? Number(v.weight) : null,
      width: v.width ? Number(v.width) : null,
      height: v.height ? Number(v.height) : null,
      depth: v.depth ? Number(v.depth) : null,
    })),
    media: productMediaData.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
      order: m.order,
    })),
    categories: productCategoriesData.map(c => ({
      id: c.id,
      name: c.name as Record<string, string>,
      slug: c.slug as Record<string, string>,
    })),
    groupId: productData.groupId,
    group: groupData ? {
      id: groupData.id,
      name: groupData.name as Record<string, string>,
      slug: groupData.slug as Record<string, string>,
    } : null,
    groupProducts: groupProductsData.map(gp => ({
      id: gp.id,
      name: gp.name as Record<string, string>,
      slug: gp.slug as Record<string, string>,
      shortDescription: gp.shortDescription as Record<string, string> | null,
      mainImageUrl: gp.mainImageUrl,
      badges: gp.badges as { icon: string; tooltip: Record<string, string> }[],
    })),
  };
}

// Termék lekérdezése ID alapján (admin felülethez)
export async function getProductById(id: string): Promise<ProductDetailItem | null> {
  const [productData] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!productData) {
    return null;
  }

  const [
    productVariantsData, 
    productMediaData, 
    productCategoriesData,
    productRecommendationsData,
    productAttachmentsData,
    groupData
  ] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
    db.select().from(productMedia).where(eq(productMedia.productId, id)).orderBy(asc(productMedia.order)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, id)),
    db.select().from(productRecommendations)
      .where(eq(productRecommendations.productId, id)),
    db.select().from(productAttachments)
      .where(eq(productAttachments.productId, id)),
    productData.groupId 
      ? db.select().from(productGroups).where(eq(productGroups.id, productData.groupId)).limit(1).then(r => r[0])
      : Promise.resolve(null),
  ]);

  return {
    id: productData.id,
    slug: productData.slug as Record<string, string>,
    name: productData.name as Record<string, string>,
    description: productData.description as Record<string, string> | null,
    shortDescription: productData.shortDescription as Record<string, string> | null,
    longDescription: productData.longDescription as Record<string, string> | null,
    specifications: productData.specifications as Record<string, unknown> | null,
    type: productData.type as "physical" | "digital",
    variants: productVariantsData.map(v => ({
      id: v.id,
      sku: v.sku,
      priceHuf: v.priceHuf,
      priceEur: v.priceEur ? Number(v.priceEur) : null,
      stock: v.stock,
      weight: v.weight ? Number(v.weight) : null,
      width: v.width ? Number(v.width) : null,
      height: v.height ? Number(v.height) : null,
      depth: v.depth ? Number(v.depth) : null,
    })),
    media: productMediaData.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
      order: m.order,
    })),
    categories: productCategoriesData.map(c => ({
      id: c.id,
      name: c.name as Record<string, string>,
      slug: c.slug as Record<string, string>,
    })),
    recommendations: productRecommendationsData.map(r => r.recommendedProductId),
    attachments: productAttachmentsData.map(a => ({
      id: a.id,
      url: a.url,
      name: a.name,
    })),
    groupId: productData.groupId,
    group: groupData ? {
      id: groupData.id,
      name: groupData.name as Record<string, string>,
      slug: groupData.slug as Record<string, string>,
    } : null,
    badges: ((productData.badges || []) as unknown[]).map(b => {
      if (typeof b === 'string') return { icon: b, tooltip: {} };
      const badge = b as { icon: string; tooltip: Record<string, string> };
      return { icon: badge.icon, tooltip: badge.tooltip || {} };
    }) as { icon: string; tooltip: Record<string, string> }[],
  };
}
export type ProductSpec = {
  key_hu: string;
  value_hu: string;
  key_en?: string;
  value_en?: string;
  key_sk?: string;
  value_sk?: string;
  [key: string]: string | undefined;
};

export type TranslationStatusItem = {
  id: string;
  nameHu: string;
  missingLanguages: ("hu" | "en" | "sk")[];
  missingAreas: string[];
  readiness: number;
  ignoreTranslationWarnings: boolean;
};

export type TranslationStatusResult = {
  items: TranslationStatusItem[];
  totalCount: number;
};

export async function getTranslationStatusProducts(filters: { 
  langMissing?: "hu" | "en" | "sk" | "all", 
  page: number, 
  limit: number 
}): Promise<TranslationStatusResult> {
  const offset = (filters.page - 1) * filters.limit;

  // We fetch ACTIVE products
  // We need name, shortDescription, longDescription, group, categories, specifications
  const baseQuery = db
    .select({
      id: products.id,
      name: products.name,
      shortDescription: products.shortDescription,
      longDescription: products.longDescription,
      specifications: products.specifications,
      ignoreTranslationWarnings: products.ignoreTranslationWarnings,
      groupName: productGroups.name,
      categoryNames: sql<Record<string, string>[]>`COALESCE(jsonb_agg(${categories.name}) FILTER (WHERE ${categories.id} IS NOT NULL), '[]'::jsonb)`,
    })
    .from(products)
    .leftJoin(productGroups, eq(products.groupId, productGroups.id))
    .leftJoin(productCategories, eq(products.id, productCategories.productId))
    .leftJoin(categories, eq(productCategories.categoryId, categories.id))
    .where(eq(products.status, "ACTIVE"))
    .groupBy(products.id, productGroups.id);

  const rawResults = await baseQuery;

  // Now we filter and process in memory because complex JSONB readiness logic is hard in Drizzle/SQL cross-platform
  // and we want precise control over the rules.
  // Note: For very large datasets, some of this should move to SQL (at least the missing lang filtering).
  
  const processedItems: TranslationStatusItem[] = rawResults.map(row => {
    const name = (row.name || {}) as Record<string, string>;
    const shortDesc = (row.shortDescription || {}) as Record<string, string>;
    const longDesc = (row.longDescription || {}) as Record<string, string>;
    const groupName = (row.groupName || {}) as Record<string, string>;
    const catNames = (row.categoryNames || []) as Record<string, string>[];
    const specs = (row.specifications || []) as ProductSpec[];

    const langs: ("hu" | "en" | "sk")[] = ["hu", "en", "sk"];
    const missingLangs: ("hu" | "en" | "sk")[] = [];
    const missingAreas = new Set<string>();

    // Readiness calculation
    let totalCheckpoints = 0;
    let completedCheckpoints = 0;

    // Critical fields
    langs.forEach(l => {
      totalCheckpoints++;
      if (name[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("NAME"); }
      
      totalCheckpoints++;
      if (shortDesc[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("DESC"); }
      
      totalCheckpoints++;
      if (longDesc[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("DESC"); }
    });

    // Important fields: Group
    if (Object.values(groupName).some(v => !!v)) {
      langs.forEach(l => {
        totalCheckpoints++;
        if (groupName[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("GROUP"); }
      });
    }

    // Important fields: Categories
    if (catNames.length > 0) {
      catNames.forEach(cat => {
        if (!cat) return;
        langs.forEach(l => {
          totalCheckpoints++;
          if (cat[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("CAT"); }
        });
      });
    }

    // Marketing (USPs) & Technical (Specs)
    // Rule: only if exists in any language
    specs.forEach(s => {
      if (!s) return;
      const isUSP = ["USP", "USP2", "USP3", "USP4", "USP5"].includes(s.key_hu);
      const area = isUSP ? "USP" : "SPECS";
      
      langs.forEach(l => {
        const val = s[`value_${l}`];
        totalCheckpoints++;
        if (val?.trim()) completedCheckpoints++; else { 
          missingLangs.push(l); 
          missingAreas.add(area); 
        }
      });
    });

    const uniqueMissingLangs = Array.from(new Set(missingLangs));
    const readiness = totalCheckpoints > 0 ? Math.round((completedCheckpoints / totalCheckpoints) * 100) : 100;

    return {
      id: row.id,
      nameHu: name.hu || "Névtelen",
      missingLanguages: uniqueMissingLangs,
      missingAreas: Array.from(missingAreas),
      readiness,
      ignoreTranslationWarnings: row.ignoreTranslationWarnings,
    };
  });

  // Apply filters
  let filteredItems = processedItems;
  if (filters.langMissing === "all") {
    // "Mind hiányzik" filter: products where all 3 languages have gaps
    filteredItems = processedItems.filter(item => item.missingLanguages.length === 3);
  } else if (filters.langMissing && ["hu", "en", "sk"].includes(filters.langMissing)) {
    const targetLang = filters.langMissing as "hu" | "en" | "sk";
    filteredItems = processedItems.filter(item => item.missingLanguages.includes(targetLang));
  } else {
    // Default: show everything that has at least one missing lang
    filteredItems = processedItems.filter(item => item.missingLanguages.length > 0);
  }

  // Final total count for pagination
  const totalCount = filteredItems.length;
  
  // Sort: ignored items to the bottom, then by readiness
  filteredItems.sort((a, b) => {
    if (a.ignoreTranslationWarnings !== b.ignoreTranslationWarnings) {
      return a.ignoreTranslationWarnings ? 1 : -1;
    }
    return a.readiness - b.readiness;
  });

  return {
    items: filteredItems.slice(offset, offset + filters.limit),
    totalCount,
  };
}
