import { Suspense } from "react";
import { getActiveProducts, getAllCategories, getAllBadgeSettings } from "@/modules/shop/queries";
import { ProductCard } from "@/modules/shop/components/product-card";
import { ProductFilters } from "@/modules/shop/components/product-filters";
import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search : undefined;
  const badge = typeof resolvedSearchParams.badge === "string" ? resolvedSearchParams.badge : undefined;
  const categoryId = typeof resolvedSearchParams.categoryId === "string" ? resolvedSearchParams.categoryId : undefined;
  const sort = typeof resolvedSearchParams.sort === "string" ? resolvedSearchParams.sort : "newest";

  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";

  const [products, categories, badgeSettings] = await Promise.all([
    getActiveProducts({ search, badge, categoryId, sort }),
    getAllCategories(),
    getAllBadgeSettings()
  ]);

  const dict: Record<Language, { title: string; description: string; noResults: string; tryAgain: string }> = {
    hu: {
      title: "Fedezd fel termékeinket",
      description: "Legyen szó hangtálakról vagy profi hangterápiás oktatásokról, nálunk megtalálod a tökéleteset.",
      noResults: "Nincs találat",
      tryAgain: "Próbálj meg más szűrési feltételeket megadni."
    },
    en: {
      title: "Discover our products",
      description: "Whether it's singing bowls or professional sound therapy training, you'll find the perfect match with us.",
      noResults: "No results found",
      tryAgain: "Try adjusting your filters or search terms."
    },
    sk: {
      title: "Objavte naše produkty",
      description: "Či už ide o spievajúce misy alebo profesionálne školenia zvukovej terapie, u nás nájdete to pravé.",
      noResults: "Nenájdené žiadne výsledky",
      tryAgain: "Skúste upraviť filtre alebo hľadaný výraz."
    }
  };

  const t = dict[lang];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-4 max-w-7xl mx-auto w-full">
      <div className="mb-12 space-y-4 text-center">
        <h1 className="font-cormorant text-4xl md:text-5xl lg:text-6xl text-brand-brown tracking-[0.01em] font-bold">
          {t.title}
        </h1>
        <p className="text-lg text-brand-black/70 max-w-2xl mx-auto font-montserrat">
          {t.description}
        </p>
      </div>

      <div className="w-full mb-10">
        <Suspense fallback={<div className="h-[72px] w-full bg-white/40 animate-pulse rounded-2xl border border-brand-bronze/20" />}>
          <ProductFilters 
            key={`${categoryId || 'all'}-${badge || 'all'}`}
            initialSearch={search} 
            initialBadge={badge} 
            initialCategoryId={categoryId} 
            categories={categories}
            badgeSettings={badgeSettings}
            lang={lang}
          />
        </Suspense>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-dashed border-brand-bronze/40 w-full mt-8">
          <h2 className="text-2xl font-bold mb-2 font-cormorant text-brand-brown tracking-[0.01em]">{t.noResults}</h2>
          <p className="text-brand-black/60 font-montserrat">{t.tryAgain}</p>
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
