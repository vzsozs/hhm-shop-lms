import Link from "next/link";
import { 
  Package,
  PackagePlus
} from "lucide-react";
import { MeinlSyncButton } from "./meinl-sync-button";
import { ProductTableClient } from "./product-table-client";

import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, categories } from "@/db/schema/shop";
import { eq, getTableColumns, sql, desc, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ sort?: string, order?: string }> }) {
  const { sort, order } = await searchParams;
  const isDesc = order === "desc";

  // Alapértelmezett rendezés
  let orderByClause = desc(products.createdAt);

  if (sort === "name") {
    orderByClause = isDesc ? desc(sql`${products.name}->>'hu'`) : asc(sql`${products.name}->>'hu'`);
  } else if (sort === "date") {
    orderByClause = isDesc ? desc(products.createdAt) : asc(products.createdAt);
  } else if (sort === "price") {
    orderByClause = isDesc ? desc(sql`MIN(${productVariants.priceHuf})`) : asc(sql`MIN(${productVariants.priceHuf})`);
  } else if (sort === "priority") {
    orderByClause = isDesc ? desc(products.priority) : asc(products.priority);
  } else if (sort === "sku") {
    orderByClause = isDesc ? desc(sql`MAX(${productVariants.sku})`) : asc(sql`MAX(${productVariants.sku})`);
  } else if (sort === "category") {
    orderByClause = isDesc ? desc(sql`(jsonb_agg(${categories.name} ORDER BY ${categories.parentId} NULLS LAST)->0)->>'hu'`) : asc(sql`(jsonb_agg(${categories.name} ORDER BY ${categories.parentId} NULLS LAST)->0)->>'hu'`);
  } else if (sort === "status") {
    orderByClause = isDesc ? desc(products.status) : asc(products.status);
  }
  // Lekérdezzük a termékeket, első képet, kategóriákat és összesített készletet/árat
  const productsList = await db
    .select({
      ...getTableColumns(products),
      // A legkisebb ár a variánsok közül
      price: sql<number>`MIN(${productVariants.priceHuf})`,
      // Az összes készlet a variánsokból
      stock: sql<number>`SUM(${productVariants.stock})`,
      // Elsődleges kép (ahol order = 0)
      image: sql<string>`MAX(CASE WHEN ${productMedia.order} = 0 AND ${productMedia.type} = 'IMAGE' THEN ${productMedia.url} ELSE NULL END)`,
      // Kategória név - NULLS LAST miatt a szülővel rendelkezők (alkategóriák) kerülnek előre
      categoryName: sql<Record<string, string>>`(jsonb_agg(${categories.name} ORDER BY ${categories.parentId} NULLS LAST)->0)`,
      // SKU
      sku: sql<string>`MAX(${productVariants.sku})`,
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId))
    .leftJoin(productCategories, eq(products.id, productCategories.productId))
    .leftJoin(categories, eq(productCategories.categoryId, categories.id))
    .groupBy(products.id)
    .orderBy(orderByClause);

  // Nincs szükség helyi SortLink-re, a ProductTableClient intézi
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="text-brand-orange" size={28} />
            Termékek
          </h1>
          <p className="text-sm text-white/50 mt-1">Az összes elérhető fizikai és digitális termék kezelése</p>
        </div>
        <div className="flex items-center gap-3">
          <MeinlSyncButton />
          <Link href="/admin/products/new" className="px-4 h-10 bg-brand-orange hover:bg-brand-orange/90 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-colors shadow-lg shadow-brand-orange/20">
            <PackagePlus size={18} />
            Új termék felvitele
          </Link>
        </div>
      </div>

      <ProductTableClient 
        products={productsList} 
      />
    </div>
  );
}
