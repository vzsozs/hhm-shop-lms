import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/modules/shop/queries";
import { ProductGallery } from "@/modules/shop/components/product-gallery";
import { ProductVariantSelector } from "@/modules/shop/components/product-variant-selector";
import { ProductContent } from "@/modules/shop/components/product-content";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

// Alapértelmezett nyelv (hu)
const DEFAULT_LANG = "hu";

// Dinamikus metaadat generálás (SEO és közösségi megosztás)
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: "Termék nem található",
    };
  }

  const name = product.name[DEFAULT_LANG] || "Hangakadémia Termék";
  const desc = product.description?.[DEFAULT_LANG] || "";

  return {
    title: `${name} | HHM Shop`,
    description: desc.slice(0, 160), // Hosszú leírás levágása SEO miatt
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);

  // Ha nem létezik a slug, visszaadunk egy 404 oldalt
  if (!product) {
    notFound();
  }

  const name = product.name[DEFAULT_LANG] || "Névtelen termék";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Vissza navigációs link */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link href="/products" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vissza a termékekhez
          </Link>
        </Button>
      </div>

      {/* Felső Szakasz: Kép és Vásárlási Irányítópult (2 oszlopos Desktopon) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Bal Oszlop: Média Galéria */}
        <div className="w-full">
          <ProductGallery media={product.media} />
        </div>

        {/* Jobb Oszlop: Cím, Ár, Variánsok és CTA */}
        <div className="flex flex-col space-y-8">
          {/* Termék Alapadatok */}
          <div>
            {product.brand && (
              <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {name}
            </h1>
            
            {/* Kategóriák */}
            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.categories.map((c) => (
                  <span 
                    key={c.id} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
                  >
                    {c.name[DEFAULT_LANG]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Variáns Választó és Kosár Gomb Kombinált Kliens Komponense */}
          <div className="bg-muted/30 rounded-xl p-6 border shadow-sm">
            <ProductVariantSelector variants={product.variants} />
          </div>

        </div>
      </div>

      {/* Alsó Szakasz: Leírások és Specifikációk (Teljes szélességben) */}
      <ProductContent product={product} lang={DEFAULT_LANG} />
      
    </div>
  );
}
