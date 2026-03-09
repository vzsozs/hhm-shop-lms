import { Suspense } from "react";
import { getActiveProducts, getAllCategories } from "@/modules/shop/queries";
import { ProductCard } from "@/modules/shop/components/product-card";
import { ProductFilters } from "@/modules/shop/components/product-filters";

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const type = (resolvedSearchParams.type === "physical" || resolvedSearchParams.type === "digital") 
      ? resolvedSearchParams.type 
      : undefined;
  const categoryId = typeof resolvedSearchParams.categoryId === "string" ? resolvedSearchParams.categoryId : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";

  const [products, categories] = await Promise.all([
    getActiveProducts({ search, type, categoryId, sort }),
    getAllCategories()
  ]);

  const lang = "hu";

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-4 max-w-7xl mx-auto w-full">
      <div className="mb-12 space-y-4 text-center">
        <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-brand-brown tracking-[0.01em] font-bold">
          Fedezd fel termékeinket
        </h1>
        <p className="text-lg text-brand-black/70 max-w-2xl mx-auto font-montserrat">
          Legyen szó hangtálakról vagy profi hangterápiás oktatásokról, nálunk megtalálod a tökéleteset.
        </p>
      </div>

      <div className="w-full mb-10">
        <Suspense fallback={<div className="h-[72px] w-full bg-white/40 animate-pulse rounded-2xl border border-brand-bronze/20" />}>
          <ProductFilters 
            initialSearch={search} 
            initialType={type} 
            initialCategoryId={categoryId} 
            categories={categories}
            lang={lang}
          />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-brand-bronze/40 w-full mt-8">
          <h2 className="text-2xl font-bold mb-2 font-cormorant text-brand-brown tracking-[0.01em]">Nincs találat</h2>
          <p className="text-brand-black/60 font-montserrat">Próbálj meg más szűrési feltételeket megadni.</p>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
