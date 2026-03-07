import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackagePlus, ArrowUpDown, Image as ImageIcon } from "lucide-react";
import { ProductActions } from "./product-actions";

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
    orderByClause = isDesc ? desc(sql`(jsonb_agg(${categories.name})->0)->>'hu'`) : asc(sql`(jsonb_agg(${categories.name})->0)->>'hu'`);
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
      // Kategória név
      categoryName: sql<Record<string, string>>`(jsonb_agg(${categories.name})->0)`,
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

  const SortLink = ({ column, children, align = "left" }: { column: string, children: React.ReactNode, align?: "left" | "right" | "center" }) => {
    const isCurrent = sort === column;
    const targetOrder = isCurrent && order === "asc" ? "desc" : "asc";
    const justifyClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
    return (
      <Link href={`?sort=${column}&order=${targetOrder}`} className={`flex items-center gap-1 hover:text-white/80 transition-colors w-full ${justifyClass}`}>
        {children}
        <ArrowUpDown className={`h-3.5 w-3.5 ${isCurrent ? 'text-brand-orange' : 'text-white/30'}`} />
      </Link>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Termékek</h1>
          <p className="text-sm text-white/50 mt-1">Az összes elérhető fizikai és digitális termék kezelése</p>
        </div>
        <Link href="/admin/products/new" className="px-4 h-10 bg-brand-orange hover:bg-brand-orange/90 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-colors shadow-lg shadow-brand-orange/20">
          <PackagePlus size={18} />
          Új termék felvitele
        </Link>
      </div>

      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden block">
        <Table>
          <TableHeader className="bg-white/5 hover:bg-white/5">
            <TableRow className="border-b-white/10 hover:bg-transparent">
              <TableHead className="text-white/50 w-[80px]">Kép</TableHead>
              <TableHead className="text-white">
                <SortLink column="name">Név</SortLink>
              </TableHead>
              <TableHead className="text-white text-right">
                <SortLink column="date" align="right">Hozzáadva</SortLink>
              </TableHead>
              <TableHead className="text-white text-right">
                <SortLink column="price" align="right">Ár (Tól)</SortLink>
              </TableHead>
              <TableHead className="text-white text-center">
                <SortLink column="priority" align="center">Sorrend</SortLink>
              </TableHead>
              <TableHead className="text-white">
                <SortLink column="sku">SKU</SortLink>
              </TableHead>
              <TableHead className="text-white">
                <SortLink column="category">Kategória</SortLink>
              </TableHead>
              <TableHead className="text-white text-center">
                <SortLink column="status" align="center">Státusz</SortLink>
              </TableHead>
              <TableHead className="text-white text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsList.map((product) => {
              const nameHu = (product.name as Record<string, string>)?.hu || "Névtelen";
              const catNameHu = product.categoryName?.hu || "Nincs kategória";
              const priceDisp = product.price ? product.price.toLocaleString("hu-HU") : "0";
              const dateAdded = new Date(product.createdAt).toLocaleDateString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <TableRow key={product.id} className="border-b-white/5 hover:bg-white/5">
                  <TableCell>
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white/30 shrink-0 overflow-hidden relative">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={nameHu} className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{nameHu}</TableCell>
                  <TableCell className="text-right text-white/70 text-sm whitespace-nowrap">{dateAdded}</TableCell>
                  <TableCell className="text-right text-white font-medium">{priceDisp} Ft</TableCell>
                  <TableCell className="text-center text-white/70">{product.priority}</TableCell>
                  <TableCell className="text-white/70 font-mono text-sm">{product.sku || "-"}</TableCell>
                  <TableCell className="text-white/70">{catNameHu}</TableCell>
                  <TableCell className="text-center">
                    {product.status === "ACTIVE" ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktív</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/10 text-white/60 border-white/20">Piszkozat</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <ProductActions productId={product.id} />
                  </TableCell>
                </TableRow>
              );
            })}
            {productsList.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-white/50">
                  Nincsenek termékek az adatbázisban.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
