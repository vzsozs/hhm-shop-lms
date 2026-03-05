import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, categories } from "@/db/schema";
import { eq, ilike, and, sql, inArray } from "drizzle-orm";

export type ProductListFilters = {
  search?: string;
  type?: "physical" | "digital";
  categoryId?: string;
};

// Visszaérkező típus a UI-hoz
export type ProductListItem = {
  id: string;
  name: Record<string, string>; // JSONB többnyelvű név { hu: string, en: string, ... }
  description: Record<string, string> | null;
  type: "physical" | "digital";
  minPriceHuf: number | null;
  minPriceEur: number | null;
  mainImageUrl: string | null;
  categories: { id: string; name: Record<string, string>; slug: string }[];
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
      name: products.name,
      description: products.description,
      type: products.type,
      minPriceHuf: sql<number>`min(${productVariants.priceHuf})`.mapWith(Number),
      minPriceEur: sql<number>`min(${productVariants.priceEur})`.mapWith(Number),
      mainImageUrl: sql<string>`min(${productMedia.url})` 
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId));

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }
  
  // Futtatás (a groupBy-t is figyelembe véve)
  const rawResults = await (baseQuery.groupBy(products.id) as any);

  // Most lekérjük az összes érintett termék kategóriáját Map-be
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      existing.push(row.category as any);
      categoriesMap.set(row.productId, existing);
    }
  }

  // Formázás és visszatérés
  return rawResults.map((r: any) => ({
    ...r,
    name: r.name as Record<string, string>,
    description: r.description as Record<string, string> | null,
    categories: categoriesMap.get(r.id) || [],
  }));
}

// Segédfüggvény a szűrő menü felépítéséhez
export async function getAllCategories() {
  const allCats = await db.select().from(categories);
  return allCats.map(c => ({
    id: c.id,
    name: c.name as Record<string, string>,
    slug: c.slug
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
  type: "image" | "video" | "sound";
};

export type ProductDetailItem = {
  id: string;
  name: Record<string, string>;
  brand: string | null;
  description: Record<string, string> | null;
  specs: Record<string, any> | null;
  type: "physical" | "digital";
  variants: ProductVariantItem[];
  media: ProductMediaItem[];
  categories: { id: string; name: Record<string, string>; slug: string }[];
};

export async function getProductById(id: string): Promise<ProductDetailItem | null> {
  const [productData] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!productData) {
    return null;
  }

  const [productVariantsData, productMediaData, productCategoriesData] = await Promise.all([
    db.select().from(productVariants).where(eq(productVariants.productId, id)),
    db.select().from(productMedia).where(eq(productMedia.productId, id)),
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(productCategories)
      .innerJoin(categories, eq(productCategories.categoryId, categories.id))
      .where(eq(productCategories.productId, id)),
  ]);

  return {
    id: productData.id,
    name: productData.name as Record<string, string>,
    brand: productData.brand,
    description: productData.description as Record<string, string> | null,
    specs: productData.specs as Record<string, any> | null,
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
      type: m.type as "image" | "video" | "sound",
    })),
    categories: productCategoriesData.map(c => ({
      id: c.id,
      name: c.name as Record<string, string>,
      slug: c.slug,
    })),
  };
}