import Image from "next/image";
import Link from "next/link";
import { ProductListItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export function ProductCard({ product, lang }: { product: ProductListItem; lang: string }) {
  const name = product.name[lang] || product.name["hu"] || "Névtelen termék";
  const desc = product.description?.[lang] || product.description?.["hu"] || "";
  
  // Ár formázó (egyelőre fixen HUF vagy EUR, függően a kéréstől, most simán megmutatjuk mindkettőt ha van)
  const priceHuf = product.minPriceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(product.minPriceHuf) : null;
  const priceEur = product.minPriceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(product.minPriceEur) : null;

  return (
    <Card className="flex flex-col h-full overflow-hidden group hover:shadow-lg transition-all">
      {/* Borítókép Container */}
      <div className="relative aspect-video sm:aspect-square w-full bg-muted/30 overflow-hidden">
        {product.mainImageUrl ? (
          <Image
            src={product.mainImageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/50">
            Nincs kép
          </div>
        )}
        
        {/* Típus Badge */}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold rounded shadow-sm border">
          {product.type === "digital" ? "Digitális" : "Fizikai"}
        </div>
      </div>

      <CardContent className="flex-grow p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          {product.categories.map((c: { id: string; name: Record<string, string>; slug: string }) => (
            <span key={c.id} className="text-[10px] uppercase font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
              {c.name[lang] || c.name["hu"] || c.slug}
            </span>
          ))}
        </div>
        
        <Link href={`/products/${product.id}`} className="hover:underline">
          <h3 className="font-semibold text-lg line-clamp-2 leading-tight mb-1">
            {name}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
          {desc}
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-auto bg-muted/10">
        <div className="flex flex-col">
          {priceHuf && <span className="font-bold text-lg">{priceHuf}</span>}
          {priceEur && <span className="text-xs text-muted-foreground">{priceEur}</span>}
          {!priceHuf && !priceEur && <span className="italic text-muted-foreground">Ár nem elérhető</span>}
        </div>
        
        <Button size="icon" variant="default" className="rounded-full h-10 w-10 shadow-md hover:scale-105 transition-transform" aria-label="Kosárba tesz">
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
