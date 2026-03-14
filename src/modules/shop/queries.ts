import { db } from "@/db";
import { products, productVariants, productCategories, categories, productGroups, badgeSettings } from "@/db/schema";
import { eq, and, sql, inArray, asc, desc } from "drizzle-orm";

export type ProductListFilters = {
  search?: string;
  badge?: string;
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

  if (filters?.badge && filters.badge !== "all") {
    conditions.push(
      sql`${products.badges} @> ${JSON.stringify([{ icon: filters.badge }])}::jsonb`
    );
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    parentId: c.parentId,
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
    sku: string | null;
  }[];
};

// Termék lekérdezése slug alapján (publikus termékoldalhoz)
export async function getProductBySlug(slug: string): Promise<ProductDetailItem | null> {
  const productData = await db.query.products.findFirst({
    where: (products, { sql }) => sql`${products.slug}->>'hu' = ${slug} OR ${products.slug}->>'en' = ${slug} OR ${products.slug}->>'sk' = ${slug}`,
    with: {
      variants: true,
      media: {
        orderBy: (media, { asc }) => [asc(media.order)],
      },
      categories: {
        with: {
          category: true,
        },
      },
      group: {
        with: {
          products: {
            where: (products, { eq }) => eq(products.status, 'ACTIVE'),
            with: {
              variants: true,
              media: {
                where: (media, { eq }) => eq(media.type, 'IMAGE'),
                orderBy: (media, { asc }) => [asc(media.order)],
              },
            },
          },
        },
      },
      attachments: true,
    },
  });

  if (!productData) {
    return null;
  }

  // Badge settings is still a separate global fetch for tooltips
  const badgeSettingsData = await db.select().from(badgeSettings);
  const badgeSettingsMap = new Map<string, Record<string, string>>();
  badgeSettingsData.forEach((s) => {
    badgeSettingsMap.set(s.iconName, s.tooltips as Record<string, string>);
  });

  const groupProductsData = productData.group?.products.map(p => ({
    id: p.id,
    name: p.name as Record<string, string>,
    slug: p.slug as Record<string, string>,
    shortDescription: p.shortDescription as Record<string, string> | null,
    mainImageUrl: p.media?.[0]?.url || null,
    badges: ((p.badges || []) as { icon: string }[]).map(badge => ({
      icon: badge.icon,
      tooltip: badgeSettingsMap.get(badge.icon) || {},
    })) as { icon: string; tooltip: Record<string, string> }[],
    sku: p.variants?.[0]?.sku || null,
  })) || [];

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
    variants: productData.variants.map(v => ({
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
    media: productData.media.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
      order: m.order,
    })),
    categories: productData.categories.map(pc => ({
      id: pc.category.id,
      name: pc.category.name as Record<string, string>,
      slug: pc.category.slug as Record<string, string>,
    })),
    groupId: productData.groupId,
    group: productData.group ? {
      id: productData.group.id,
      name: productData.group.name as Record<string, string>,
      slug: productData.group.slug as Record<string, string>,
    } : null,
    groupProducts: groupProductsData,
  };
}

export async function getAllBadgeSettings() {
  const settings = await db.select().from(badgeSettings);
  return settings;
}

// Termék lekérdezése ID alapján (admin felülethez)
export async function getProductById(id: string): Promise<ProductDetailItem | null> {
  const productData = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.id, id),
    with: {
      variants: true,
      media: {
        orderBy: (media, { asc }) => [asc(media.order)],
      },
      categories: {
        with: {
          category: true,
        },
      },
      recommendations: true,
      attachments: true,
      group: true,
    },
  });

  if (!productData) {
    return null;
  }

  // Still need badge settings for tooltips
  const badgeSettingsData = await db.select().from(badgeSettings);
  const badgeSettingsMap = new Map<string, Record<string, string>>();
  badgeSettingsData.forEach((s) => {
    badgeSettingsMap.set(s.iconName, s.tooltips as Record<string, string>);
  });

  return {
    id: productData.id,
    slug: productData.slug as Record<string, string>,
    name: productData.name as Record<string, string>,
    description: productData.description as Record<string, string> | null,
    shortDescription: productData.shortDescription as Record<string, string> | null,
    longDescription: productData.longDescription as Record<string, string> | null,
    specifications: productData.specifications as Record<string, unknown> | null,
    type: productData.type as "physical" | "digital",
    variants: productData.variants.map(v => ({
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
    media: productData.media.map(m => ({
      id: m.id,
      url: m.url,
      type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
      order: m.order,
    })),
    categories: productData.categories.map(pc => ({
      id: pc.category.id,
      name: pc.category.name as Record<string, string>,
      slug: pc.category.slug as Record<string, string>,
    })),
    recommendations: productData.recommendations.map(r => r.recommendedProductId),
    attachments: productData.attachments.map(a => ({
      id: a.id,
      url: a.url,
      name: a.name,
    })),
    groupId: productData.groupId,
    group: productData.group ? {
      id: productData.group.id,
      name: productData.group.name as Record<string, string>,
      slug: productData.group.slug as Record<string, string>,
    } : null,
    badges: ((productData.badges || []) as { icon: string }[])
      .filter(b => b && b.icon)
      .map(b => ({
        icon: b.icon,
        tooltip: badgeSettingsMap.get(b.icon) || { hu: "", en: "", sk: "" }
      })),
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

  // Alap feltétel: csak aktív termékek
  const conditions = [eq(products.status, "ACTIVE")];

  // SQL szintű szűrés a hiányzó nyelvekre (név, leírások és USP-k alapján)
  const isMissing = (l: string) => sql`(${products.name}->>${l} IS NULL OR ${products.name}->>${l} = '' 
    OR ${products.shortDescription}->>${l} IS NULL OR ${products.shortDescription}->>${l} = '' 
    OR ${products.longDescription}->>${l} IS NULL OR ${products.longDescription}->>${l} = ''
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(${products.specifications}, '[]'::jsonb)) AS s 
      WHERE (s->>'key_hu' ILIKE 'USP%') 
      AND (s->>${'value_' + l} IS NULL OR s->>${'value_' + l} = '')
    )
  )`;

  if (filters.langMissing === "all") {
    conditions.push(sql`${isMissing("hu")} AND ${isMissing("en")} AND ${isMissing("sk")}`);
  } else if (filters.langMissing && ["hu", "en", "sk"].includes(filters.langMissing)) {
    conditions.push(isMissing(filters.langMissing));
  } else {
    // Alapértelmezett: legalább egy szint hiányzik bármelyik nyelvből
    conditions.push(sql`${isMissing("hu")} OR ${isMissing("en")} OR ${isMissing("sk")}`);
  }

  // 1. Összes szám lekérése a paginációhoz
  const [totalCountResult] = await db
    .select({ count: sql<number>`count(DISTINCT ${products.id})`.mapWith(Number) })
    .from(products)
    .where(and(...conditions));
  
  const totalCount = totalCountResult?.count || 0;

  // 2. Adatok lekérése paginálva
  const rawResults = await db
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
    .where(and(...conditions))
    .groupBy(products.id, productGroups.id)
    .orderBy(asc(products.ignoreTranslationWarnings), asc(sql`${products.name}->>'hu'`))
    .limit(filters.limit)
    .offset(offset);

  // 3. Paginált eredmények feldolgozása JS szinten (readiness számítás)
  const items: TranslationStatusItem[] = rawResults.map(row => {
    const name = (row.name || {}) as Record<string, string>;
    const shortDesc = (row.shortDescription || {}) as Record<string, string>;
    const longDesc = (row.longDescription || {}) as Record<string, string>;
    const groupName = (row.groupName || {}) as Record<string, string>;
    const catNames = (row.categoryNames || []) as Record<string, string>[];
    const specs = (row.specifications || []) as ProductSpec[];

    const langs: ("hu" | "en" | "sk")[] = ["hu", "en", "sk"];
    const missingLangs: ("hu" | "en" | "sk")[] = [];
    const missingAreas = new Set<string>();

    let totalCheckpoints = 0;
    let completedCheckpoints = 0;

    langs.forEach(l => {
      totalCheckpoints++;
      if (name[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("NAME"); }
      
      totalCheckpoints++;
      if (shortDesc[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("DESC"); }
      
      totalCheckpoints++;
      if (longDesc[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("DESC"); }
    });

    if (Object.values(groupName).some(v => !!v)) {
      langs.forEach(l => {
        totalCheckpoints++;
        if (groupName[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("GROUP"); }
      });
    }

    if (catNames.length > 0) {
      catNames.forEach(cat => {
        if (!cat) return;
        langs.forEach(l => {
          totalCheckpoints++;
          if (cat[l]?.trim()) completedCheckpoints++; else { missingLangs.push(l); missingAreas.add("CAT"); }
        });
      });
    }

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
      missingLanguages: uniqueMissingLangs as ("hu" | "en" | "sk")[],
      missingAreas: Array.from(missingAreas),
      readiness,
      ignoreTranslationWarnings: row.ignoreTranslationWarnings,
    };
  });

  return {
    items,
    totalCount,
  };
}
