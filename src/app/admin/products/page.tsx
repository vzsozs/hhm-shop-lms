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
import { eq, getTableColumns, sql, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
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
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId))
    .leftJoin(productCategories, eq(products.id, productCategories.productId))
    .leftJoin(categories, eq(productCategories.categoryId, categories.id))
    .groupBy(products.id)
    .orderBy(desc(products.createdAt));

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
                <button className="flex items-center gap-1 hover:text-white/80 transition-colors">
                  Név
                  <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                </button>
              </TableHead>
              <TableHead className="text-white">
                <button className="flex items-center gap-1 hover:text-white/80 transition-colors">
                  Kategória
                  <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                </button>
              </TableHead>
              <TableHead className="text-white text-right">
                <button className="flex items-center justify-end gap-1 hover:text-white/80 transition-colors w-full">
                  Ár (Tól)
                  <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                </button>
              </TableHead>
              <TableHead className="text-white text-right">
                <button className="flex items-center justify-end gap-1 hover:text-white/80 transition-colors w-full">
                  Hozzáadva
                  <ArrowUpDown className="h-3.5 w-3.5 text-white/30" />
                </button>
              </TableHead>
              <TableHead className="text-white text-center">Státusz</TableHead>
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
                  <TableCell className="text-white/70">{catNameHu}</TableCell>
                  <TableCell className="text-right text-white font-medium">{priceDisp} Ft</TableCell>
                  <TableCell className="text-right text-white/70 text-sm whitespace-nowrap">{dateAdded}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center text-white/50">
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
