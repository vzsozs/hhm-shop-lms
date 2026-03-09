import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, categories, productRecommendations, productAttachments, productGroups } from "@/db/schema";
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
  categories: { id: string; name: Record<string, string>; slug: Record<string, string> }[];
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
        SELECT ${productMedia.url}
        FROM ${productMedia}
        WHERE ${productMedia.productId} = ${products.id}
        ORDER BY ${productMedia.order} ASC
        LIMIT 1
      )`
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId));

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

  // Formázás és visszatérés
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rawResults.map((r: any) => ({
    ...r,
    name: r.name as Record<string, string>,
    description: r.description as Record<string, string> | null,
    shortDescription: r.shortDescription as Record<string, string> | null,
    categories: categoriesMap.get(r.id) || [],
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
  slug: Record<string, string>; // SEO-barát URL azonosító
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
};

// Termék lekérdezése slug alapján (publikus termékoldalhoz)
export async function getProductBySlug(slug: string): Promise<ProductDetailItem | null> {
  const [productData] = await db
    .select()
    .from(products)
    .where(sql`${products.slug}->>'hu' = ${slug}`)
    .limit(1);

  if (!productData) {
    return null;
  }

  const [productVariantsData, productMediaData, productCategoriesData] = await Promise.all([
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
    productAttachmentsData
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
  };
}