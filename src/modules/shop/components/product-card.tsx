import Image from "next/image";
import Link from "next/link";
import { ProductListItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ProductCard({ product, lang }: { product: ProductListItem; lang: string }) {
  const dict: Record<string, Record<string, string>> = {
    hu: {
      features: "Jellemzők",
      noData: "Nincs rendelkezésre álló adat",
      more: "továbbiak...",
      priceNotAvailable: "Ár nem elérhető",
      unnamedProduct: "Névtelen termék",
      addToCart: "Kosárba tesz"
    },
    en: {
      features: "Features",
      noData: "No data available",
      more: "more...",
      priceNotAvailable: "Price not available",
      unnamedProduct: "Unnamed product",
      addToCart: "Add to cart"
    },
    sk: {
      features: "Vlastnosti",
      noData: "Žiadne údaje nie sú k dispozícii",
      more: "ďalšie...",
      priceNotAvailable: "Cena nie je k dispozícii",
      unnamedProduct: "Nepomenovaný produkt",
      addToCart: "Vložiť do košíka"
    }
  };

  const t = dict[lang] || dict.hu;

  const name = (product.name as Record<string, string>)[lang] || product.name["hu"] || t.unnamedProduct;
  const desc = product.description ? (product.description as Record<string, string>)[lang] || product.description["hu"] || "" : "";
  
  // Ár formázó (egyelőre fixen HUF vagy EUR, függően a kéréstől, most simán megmutatjuk mindkettőt ha van)
  const priceHuf = product.minPriceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(product.minPriceHuf) : null;
  const priceEur = product.minPriceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(product.minPriceEur) : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-all border-brand-bronze/20 bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl p-0 gap-0">
      {/* Borítókép Container - Kifutó */}
      <div className="relative aspect-video sm:aspect-square w-full bg-[#f3ede8] overflow-hidden shrink-0 group/img">
        {product.mainImageUrl ? (
          <Link href={`/products/${product.slug[lang] || product.slug["hu"]}`} className="block w-full h-full relative cursor-pointer">
            <Image
              src={product.mainImageUrl}
              alt={name}
              fill
              className="object-cover transition-transform"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {/* Hover Overlay - Dinamikus specifikációk */}
            <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm p-4 transition-transform duration-300 translate-y-full group-hover/img:translate-y-0 border-t border-brand-bronze/10">
              <p className="text-[10px] font-bold tracking-widest uppercase text-brand-bronze mb-2">{t.features}</p>
              <ul className="space-y-1">
                {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                   (product.specifications as Array<Record<string, string>>).slice(0, 4).map((spec, i) => {
                     const key = spec[`key_${lang}`] || spec.key_hu || spec.key_en;
                     const value = spec[`value_${lang}`] || spec.value_hu || spec.value_en;
                     return (
                       <li key={i} className="flex items-start gap-2 text-[11px] leading-tight text-brand-black/80 font-montserrat">
                         <div className="w-1 h-1 rounded-full bg-brand-bronze mt-1.5 shrink-0" />
                         <span className="line-clamp-2">
                           <strong className="text-brand-brown">{key}:</strong> {value}
                         </span>
                       </li>
                     );
                   })
                ) : (
                  <li className="text-[10px] italic text-brand-black/40 font-montserrat">{t.noData}</li>
                )}
              </ul>
              {Array.isArray(product.specifications) && product.specifications.length > 4 && (
                <p className="text-[9px] text-brand-bronze mt-2 font-bold uppercase tracking-wider text-right">{t.more}</p>
              )}
            </div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f3ede8] via-[#ede3d8] to-[#d9c9b4] gap-3">
            <Image
              src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg"
              alt="Hangakadémia"
              width={208}
              height={100}
              className="w-52 h-auto opacity-100"
            />
          </div>
        )}
        
        {/* Badge-ek (Dinamikus) */}
        <div className="absolute top-3 right-3 flex flex-row gap-2 z-20">
          {product.badges && product.badges.length > 0 && (
            product.badges.map((badge, idx) => (
              <div 
                key={idx} 
                className="w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center text-brand-brown rounded-full shadow-sm border border-brand-bronze/20 transform hover:scale-110 transition-transform overflow-hidden"
                title={badge.tooltip?.[lang] || badge.tooltip?.["hu"] || ""}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={`/assets/badges/${badge.icon}`}
                    alt={badge.icon}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CardContent className="flex-grow p-5 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-2 font-montserrat min-h-[22px]">
           {product.categories.map((c: { id: string; name: Record<string, string>; slug: Record<string, string> }) => {
             const catName = c.name[lang] || c.name["hu"] || c.slug[lang] || c.slug["hu"];
             const displayTitle = catName.length > 18 ? catName.slice(0, 15) + "..." : catName;
             return (
               <Link 
                 key={c.id} 
                 href={`/?categoryId=${c.id}`}
                 className="text-[8px] font-bold tracking-widest uppercase text-brand-brown/80 bg-brand-bronze/10 px-2 py-1 flex items-center gap-1 rounded-sm hover:bg-brand-bronze/20 hover:text-brand-brown transition-colors cursor-pointer"
                 title={catName}
               >
                 {displayTitle}
               </Link>
             );
           })}
        </div>
        
        <Link href={`/products/${product.slug[lang] || product.slug["hu"]}`} className="hover:underline decoration-brand-bronze/50 underline-offset-4">
          <h3 className="font-bold text-xl lg:text-2xl line-clamp-2 leading-tight mb-1 font-cormorant text-brand-brown tracking-tight">
            {name}
          </h3>
        </Link>
        
      </CardContent>

      <CardFooter className="p-5 flex items-center justify-between border-t border-brand-bronze/10 mt-auto bg-transparent pb-4">
        <div className="flex flex-col">
          {lang === "hu" ? (
            <>
              {priceHuf && <span className="font-bold text-lg text-brand-black">{priceHuf}</span>}
              {priceEur && <span className="text-xs text-brand-black/60">{priceEur}</span>}
            </>
          ) : (
            <>
              {priceEur && <span className="font-bold text-lg text-brand-black">{priceEur}</span>}
            </>
          )}
          {((lang === "hu" && !priceHuf && !priceEur) || (lang !== "hu" && !priceEur)) && (
            <span className="italic text-brand-black/50 text-sm">{t.priceNotAvailable}</span>
          )}
        </div>
        
        <Button size="icon" className="rounded-full h-11 w-11 shadow-md hover:scale-105 transition-transform bg-[#8a7964] hover:bg-[#6c5e4d] text-white border-none" aria-label={t.addToCart}>
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
