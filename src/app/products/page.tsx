import { Suspense } from "react";
import { getActiveProducts, getAllCategories } from "@/modules/shop/queries";
import { ProductCard } from "@/modules/shop/components/product-card";
import { ProductFilters } from "@/modules/shop/components/product-filters";

// Dinamikus metaadatok /products oldalhoz
export const metadata = {
  title: "HHM Shop - Termékek",
  description: "Válogass a Hangakadémia fizikai és digitális termékei között.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; type?: "physical" | "digital"; categoryId?: string };
}) {
  // 1. URL paraméterek kiszedése 
  // (App router-nél type casting kell, mert alapból Promise<any> vagy {[key: string]: string | string[] | undefined})
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const type = (searchParams.type === "physical" || searchParams.type === "digital") 
      ? searchParams.type 
      : undefined;
  const categoryId = typeof searchParams.categoryId === "string" ? searchParams.categoryId : undefined;

  // 2. Szerver oldali adatlekérés (párhuzamosan DB-ből)
  const [products, categories] = await Promise.all([
    getActiveProducts({ search, type, categoryId }),
    getAllCategories()
  ]);

  // Alapértelmezett nyelv egyelőre magyar (később Next.js middleware-ből jöhet az aktuális nyelv)
  const lang = "hu";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Fedezd fel termékeinket</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Legyen szó profi hangszerekről vagy exkluzív digitális letöltésekről, nálunk megtalálod.
        </p>
      </div>

      {/* Kereső és Szűrő Sáv - useSearchParams miatt Suspense-ben */}
      <Suspense fallback={<div className="h-[72px] w-full bg-muted/20 animate-pulse rounded-xl" />}>
        <ProductFilters 
          initialSearch={search} 
          initialType={type} 
          initialCategoryId={categoryId} 
          categories={categories}
          lang={lang}
        />
      </Suspense>

      {/* Termékek Gridje */}
      {products.length === 0 ? (
        <div className="text-center py-20 px-4 bg-muted/20 rounded-xl border border-dashed mt-8">
          <h2 className="text-2xl font-semibold mb-2">Nincs találat</h2>
          <p className="text-muted-foreground">Próbálj meg más szűrési feltételeket megadni.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
