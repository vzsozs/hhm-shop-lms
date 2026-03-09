import Image from "next/image";
import Link from "next/link";
import { ProductListItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Download, Package } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ProductCard({ product, lang }: { product: ProductListItem; lang: string }) {
  const name = product.name[lang] || product.name["hu"] || "Névtelen termék";
  const desc = product.description?.[lang] || product.description?.["hu"] || "";
  
  // Ár formázó (egyelőre fixen HUF vagy EUR, függően a kéréstől, most simán megmutatjuk mindkettőt ha van)
  const priceHuf = product.minPriceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(product.minPriceHuf) : null;
  const priceEur = product.minPriceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(product.minPriceEur) : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-all border-brand-bronze/20 bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl p-0 gap-0">
      {/* Borítókép Container - Kifutó */}
      <div className="relative aspect-video sm:aspect-square w-full bg-[#f3ede8] overflow-hidden shrink-0">
        {product.mainImageUrl ? (
          <Link href={`/products/${product.slug[lang] || product.slug["hu"]}`} className="block w-full h-full relative cursor-pointer">
            <Image
              src={product.mainImageUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f3ede8] via-[#ede3d8] to-[#d9c9b4] gap-3">
            <img
              src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg"
              alt="Hangakadémia"
              className="w-24 h-auto opacity-40"
            />
          </div>
        )}
        
        {/* Típus Badge Ikonnal */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 flex items-center justify-center text-brand-brown rounded-full shadow-sm border border-brand-bronze/20">
          {product.type === "digital" ? (
             <Download className="w-4 h-4" />
          ) : (
             <Package className="w-4 h-4" />
          )}
        </div>
      </div>

      <CardContent className="flex-grow p-5 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-2 font-montserrat">
           {product.categories.map((c: { id: string; name: Record<string, string>; slug: Record<string, string> }) => (
             <span key={c.id} className="text-[10px] font-bold tracking-widest uppercase text-brand-brown/80 bg-brand-bronze/10 px-2 py-1 flex items-center gap-1 rounded-sm">
              {c.name[lang] || c.name["hu"] || c.slug[lang] || c.slug["hu"]}
            </span>
          ))}
        </div>
        
        <Link href={`/products/${product.slug[lang] || product.slug["hu"]}`} className="hover:underline decoration-brand-bronze/50 underline-offset-4">
          <h3 className="font-bold text-xl lg:text-2xl line-clamp-2 leading-tight mb-1 font-cormorant text-brand-brown tracking-normal">
            {name}
          </h3>
        </Link>
        
        {/* Rövid leírás */}
        {product.shortDescription && (
          <p className="text-xs text-brand-black/60 line-clamp-2 mt-1 mb-1 font-montserrat">
            {product.shortDescription[lang] || product.shortDescription["hu"]}
          </p>
        )}
        
        <p className="text-sm text-brand-black/70 line-clamp-2 mt-auto font-montserrat font-medium">
          {desc}
        </p>
      </CardContent>

      <CardFooter className="p-5 flex items-center justify-between border-t border-brand-bronze/10 mt-auto bg-transparent pb-4">
        <div className="flex flex-col">
          {priceHuf && <span className="font-bold text-lg text-brand-black">{priceHuf}</span>}
          {priceEur && <span className="text-xs text-brand-black/60">{priceEur}</span>}
          {!priceHuf && !priceEur && <span className="italic text-brand-black/50 text-sm">Ár nem elérhető</span>}
        </div>
        
        <Button size="icon" className="rounded-full h-11 w-11 shadow-md hover:scale-105 transition-transform bg-[#8a7964] hover:bg-[#6c5e4d] text-white border-none" aria-label="Kosárba tesz">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
