import { StatCard } from "@/components/admin/stat-card";
import { DollarSign, ShoppingCart, Users, TrendingUp, PackagePlus, UserPlus, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { products, productVariants, productMedia, categories, productCategories } from "@/db/schema/shop";
import { eq, getTableColumns, sql, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { ProductActions } from "./products/product-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Lekérdezés az utolsó 3 aktív termékre készlettel, árral, képpel, és kategóriával
  const recentProductsList = await db
    .select({
      ...getTableColumns(products),
      price: sql<number>`MIN(${productVariants.priceHuf})`,
      stock: sql<number>`SUM(${productVariants.stock})`,
      image: sql<string>`MAX(CASE WHEN ${productMedia.order} = 0 AND ${productMedia.type} = 'IMAGE' THEN ${productMedia.url} ELSE NULL END)`,
      categoryName: sql<Record<string, string>>`(jsonb_agg(${categories.name})->0)`,
    })
    .from(products)
    .leftJoin(productVariants, eq(products.id, productVariants.productId))
    .leftJoin(productMedia, eq(products.id, productMedia.productId))
    .leftJoin(productCategories, eq(products.id, productCategories.productId))
    .leftJoin(categories, eq(productCategories.categoryId, categories.id))
    .groupBy(products.id)
    .orderBy(desc(products.createdAt))
    .limit(3);
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kezelőpult</h1>
          <p className="text-sm text-white/50 mt-1">Áttekintés az üzlet és az oktatási platform teljesítményéről</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/students/new" className="h-10 w-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white transition-colors" title="Új tanuló felvitele">
            <UserPlus size={20} />
          </Link>
          <Link href="/admin/products/new" className="h-10 w-10 bg-brand-orange hover:bg-brand-orange/90 rounded-xl flex items-center justify-center text-white transition-colors shadow-lg shadow-brand-orange/20" title="Új termék feltöltése">
            <PackagePlus size={20} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Napi bevétel"
          value="145 000 Ft"
          icon={<DollarSign size={20} />}
          description="Ebből Stripe: 120 000 Ft"
          trend="up"
        />
        <StatCard
          title="Heti bevétel"
          value="980 000 Ft"
          icon={<TrendingUp size={20} />}
          description="+12% az előző héthez képest"
          trend="up"
        />
        <StatCard
          title="Új rendelések"
          value="12"
          icon={<ShoppingCart size={20} />}
          description="Feldolgozásra vár: 3"
          trend="neutral"
        />
        <StatCard
          title="Aktív tanulók"
          value="1 450"
          icon={<Users size={20} />}
          description="+45 az elmúlt 30 napban"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card-bg border border-white/5 rounded-2xl p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Bevételi trendek</h3>
          <div className="flex items-center justify-center h-[300px] border border-white/5 border-dashed rounded-xl bg-white/5 text-white/30 text-sm">
            Grafikon helye (Recharts előkészítve)
          </div>
        </div>
        <div className="bg-card-bg border border-white/5 rounded-2xl p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold text-white mb-4">Legutóbbi rendelések</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-white">Rendelés #{1000 + i}</p>
                  <p className="text-xs text-white/40">Gipsz Jakab • 2 perce</p>
                </div>
                <div className="text-sm font-bold text-white">
                  {(15000 * i).toLocaleString("hu-HU")} Ft
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legutóbb hozzáadott termékek */}
      <div className="bg-card-bg border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Legutóbb hozzáadott termékek</h3>
          <Link href="/admin/products" className="text-sm text-brand-orange hover:text-brand-orange/80 font-medium">
            Összes megtekintése
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-sm text-white/40">
                <th className="pb-3 font-medium">Termék</th>
                <th className="pb-3 font-medium">Kategória</th>
                <th className="pb-3 font-medium">Ár</th>
                <th className="pb-3 font-medium">Készlet</th>
                <th className="pb-3 font-medium text-right">Művelet</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentProductsList.map((product) => {
                const nameHu = (product.name as Record<string, string>)?.hu || "Névtelen";
                const catNameHu = product.categoryName?.hu || "Nincs kategória";
                const priceDisp = product.price ? product.price.toLocaleString("hu-HU") : "0";
                
                return (
                  <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white/30 shrink-0 overflow-hidden relative">
                          {product.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image} alt={nameHu} className="object-cover w-full h-full" />
                          ) : (
                            <ImageIcon size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white line-clamp-1 max-w-[200px]" title={nameHu}>{nameHu}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-white/70">{catNameHu}</td>
                    <td className="py-4 text-white font-medium">{priceDisp} Ft</td>
                    <td className="py-4">
                      {product.status === "ACTIVE" ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktív</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-white/10 text-white/60 border-white/20">Piszkozat</Badge>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      <ProductActions productId={product.id} />
                    </td>
                  </tr>
                );
              })}
              {recentProductsList.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-6 text-center text-white/50">Nincs rögzített termék</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
