"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductDetailItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { Award, Shield, Star, Check, ExternalLink, ArrowLeft } from "lucide-react"; 
import DOMPurify from "isomorphic-dompurify";
export function ProductDetailClient({ product }: { product: ProductDetailItem }) {
  const [activeTab, setActiveTab] = useState<"specs" | "look">("specs");
  const [activeImageId, setActiveImageId] = useState(product.media[0]?.id);
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0]?.id);
  
  const activeImage = product.media.find(m => m.id === activeImageId) || product.media[0];
  const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];

  const priceHuf = activeVariant?.priceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(activeVariant.priceHuf) : null;
  const priceEur = activeVariant?.priceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(activeVariant.priceEur) : null;

  // Segédfüggvény [szöveg](url) parsolásához
  const renderValueWithLinks = (text: string) => {
    const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a 
            key={i} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-brand-bronze hover:text-brand-brown underline inline-flex items-center gap-1 transition-colors"
          >
            {match[1]}
            <ExternalLink size={12} className="shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  const sanitizedLongDescription = product.longDescription?.hu 
    ? DOMPurify.sanitize(product.longDescription.hu, { 
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: ["script", "style", "iframe"],
      }) 
    : null;
  return (
    <div className="relative min-h-screen bg-brand-lightbg pt-12 pb-24">
      {/* Background Mandala Container - Fixes sticky overflow issue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] w-[80%] max-w-[900px] opacity-10 rotate-12">
          <Image src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg" alt="Mandala textúra" width={900} height={900} className="w-full h-auto" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brand-black/60 hover:text-brand-bronze transition-colors font-montserrat text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Vissza a termékekhez
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
        
        {/* Bal Oszlop - 60% */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          {/* Fő Kép és Galéria */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-[#f3ede8] rounded-2xl overflow-hidden relative border border-brand-bronze/10">
              {activeImage?.url ? (
                <Image 
                  src={activeImage.url} 
                  alt={product.name["hu"] || "Termék kép"} 
                  fill 
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-black/40 font-montserrat">Nincs kép</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.media.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.media.map(media => (
                  <button 
                    key={media.id}
                    onClick={() => setActiveImageId(media.id)}
                    className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageId === media.id ? 'border-brand-bronze shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image src={media.url} alt="Thumbnail" fill className="object-cover" />
                    {media.type === "YOUTUBE" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-transparent border-l-brand-black ml-1"></div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Long Description */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 lg:p-10 border border-brand-bronze/20 shadow-sm mt-4">
            <h2 className="text-3xl font-cormorant font-bold text-brand-brown mb-6 uppercase tracking-widest">Részletes leírás</h2>
            <div className="prose prose-stone max-w-none font-montserrat text-brand-black/80 leading-loose">
              {sanitizedLongDescription ? (
                 <div dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }} />
              ) : (
                <p className="italic">Nincs elérhető leírás ehhez a termékhez.</p>
              )}
            </div>
          </div>

          {/* Tabs: Specs & Look */}
          <div className="mt-4">
            <div className="flex border-b border-brand-bronze/20 mb-6 font-cormorant">
              <button 
                onClick={() => setActiveTab("specs")}
                className={`py-3 px-6 font-bold text-2xl tracking-widest transition-colors border-b-2 uppercase ${activeTab === "specs" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
              >
                Jellemzők
              </button>
              <button 
                onClick={() => setActiveTab("look")}
                className={`py-3 px-6 font-bold text-2xl tracking-widest transition-colors border-b-2 uppercase ${activeTab === "look" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
              >
                Méretek és Súly
              </button>
            </div>
            
            <div className="min-h-[200px] font-montserrat text-brand-black/80 bg-white/40 p-6 rounded-2xl border border-brand-bronze/10 shadow-sm">
              {activeTab === "specs" && (
                <div>
                   {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                     <ul className="space-y-4">
                       {(product.specifications as Array<Record<string, string>>).map((spec, i) => {
                         const key = spec.key_hu || spec.key_en || `Jellemző ${i + 1}`;
                         const val = spec.value_hu || spec.value_en || "–";
                         return (
                           <li key={i} className="flex gap-3 items-center">
                             <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                               <Check className="w-3.5 h-3.5 text-brand-brown" />
                             </div>
                             <div className="flex-1">
                              <strong>{key}:</strong> {renderValueWithLinks(val)}
                            </div>
                           </li>
                         );
                       })}
                     </ul>
                   ) : (
                     <p className="italic text-brand-black/50">Nincsenek specifikációk rögzítve.</p>
                   )}
                </div>
              )}
              {activeTab === "look" && (
                <div>
                  <ul className="space-y-4">
                     {activeVariant?.weight && (
                       <li className="flex gap-3 items-center">
                         <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                           <div className="w-2 h-2 rounded-full bg-brand-brown"></div>
                         </div>
                         <span><strong>Súly:</strong> {activeVariant.weight} kg</span>
                       </li>
                     )}
                     {activeVariant?.width && activeVariant?.height && activeVariant?.depth && (
                        <li className="flex gap-3 items-center">
                         <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                           <div className="w-2 h-2 rounded-full bg-brand-brown"></div>
                         </div>
                         <span><strong>Méretek (Szé x Ma x Mé):</strong> {activeVariant.width} x {activeVariant.height} x {activeVariant.depth} cm</span>
                       </li>
                     )}
                     {!activeVariant?.weight && !activeVariant?.width && <p>Nincsenek méretek megadva ehhez a variációhoz.</p>}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Jobb Oszlop - 40% - Sticky Card */}
        <div className="w-full lg:w-[40%] text-brand-black relative z-10 lg:pl-10">
          <div className="lg:sticky lg:top-32 flex flex-row gap-4 lg:gap-6 font-montserrat">
            
            {/* Dinamikus Badge Placeholder - Fentről lefelé a cím bal oldalán flexben */}
            <div className="flex flex-col gap-3 pt-2 shrink-0">
              <div className="w-8 h-8 rounded-full border border-brand-bronze/30 flex items-center justify-center text-brand-brown bg-[#f8f7f5] shadow-sm transform hover:scale-110 transition-transform" title="Prémium Minőség">
                <Award className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-brand-bronze/30 flex items-center justify-center text-brand-brown bg-[#f8f7f5] shadow-sm transform hover:scale-110 transition-transform" title="Eredeti">
                <Shield className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full border border-brand-bronze/30 flex items-center justify-center text-brand-brown bg-[#f8f7f5] shadow-sm transform hover:scale-110 transition-transform" title="Kiemelt Ajánlat">
                <Star className="w-4 h-4" />
              </div>
            </div>

            {/* Fő Oszlop Tartalom */}
            <div className="flex flex-col gap-6 w-full">
               <div className="flex flex-col gap-1">
                {product.group && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-bronze bg-brand-bronze/5 px-2 py-0.5 rounded border border-brand-bronze/10">
                      {product.group.name["hu"]} Termékcsalád
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2 font-montserrat">
                  {product.categories.map((c) => (
                    <span key={c.id} className="text-[10px] font-bold tracking-widest uppercase text-brand-brown/80 bg-brand-bronze/10 px-2 py-1 flex items-center gap-1 rounded-sm">
                      {c.name["hu"] || c.slug["hu"]}
                    </span>
                  ))}
                </div>
                <h1 className="font-montserrat text-lg lg:text-2xl font-bold text-brand-black tracking-widest uppercase leading-tight mb-4">
                  {product.name["hu"] || "Terméknév"}
                </h1>
              </div>

            {/* Felső Rövid Ismertető Pipa Pontokkal */}
            <div className="text-brand-black/80 text-sm space-y-2 pb-4">
              {product.shortDescription?.["hu"] ? (
                 <div className="whitespace-pre-line leading-relaxed flex flex-col gap-3">
                   {product.shortDescription["hu"].split("\n").map((line, i) => {
                      if (!line.trim()) return null;
                      return (
                        <div key={i} className="flex gap-3 items-start">
                          <Check className="w-4 h-4 text-[#d1a052] shrink-0 mt-0.5" />
                          <span className="font-medium text-xs leading-relaxed">{line}</span>
                        </div>
                      )
                   })}
                 </div>
              ) : (
                 <p className="text-sm italic">Nincs megadva rövid ismertető.</p>
              )}
            </div>

            {/* Ár és Termék Jellemzők */}
            <div className="flex flex-col gap-3 mt-2">
               <div className="flex flex-col gap-0.5">
                 {priceHuf && <div className="text-3xl font-bold text-brand-black">{priceHuf}</div>}
                 {priceEur && <div className="text-lg text-brand-black/50 font-medium">{priceEur}</div>}
                 {!priceHuf && !priceEur && <div className="text-xl font-bold text-brand-black italic">Ár nem elérhető</div>}
               </div>

               {/* Specifikációk kistábla formátumban */}
               {Array.isArray(product.specifications) && product.specifications.length > 0 && (
                 <div className="flex flex-col gap-0.5 mt-2 text-xs text-brand-black">
                   {(product.specifications as Array<Record<string, string>>).slice(0, 3).map((spec, i) => {
                     const key = spec.key_hu || spec.key_en || `Jellemző ${i + 1}`;
                     const val = spec.value_hu || spec.value_en || "–";
                     return (
                       <div key={i} className="flex gap-2 items-center">
                         <Award className="w-3.5 h-3.5 text-brand-black/60 shrink-0" />
                         <span className="capitalize text-brand-black/60">{key}:</span>
                         <span className="font-bold">{renderValueWithLinks(val)}</span>
                       </div>
                     );
                   })}
                 </div>
               )}
            </div>

            {/* Kosárba gomb */}
            <div className="mt-2">
              <Button className="w-full sm:w-auto px-8 h-12 text-sm bg-brand-bronze hover:bg-[#726251] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 font-bold tracking-wider border border-transparent">
                Kosárba rakom
              </Button>
            </div>

            {/* Termékcsalád tagjai (Kártyás megjelenítés) */}
            {product.groupProducts && product.groupProducts.length > 1 && (
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between border-b border-brand-bronze/10 pb-2">
                  <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider">A család további tagjai</h4>
                  <span className="text-[10px] text-brand-black/40 font-medium bg-brand-bronze/5 px-2 py-0.5 rounded">{product.groupProducts.length} termék</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.groupProducts.map((gp) => {
                    const isCurrent = gp.id === product.id;
                    return (
                      <Link 
                        key={gp.id}
                        href={`/products/${gp.slug["hu"]}`}
                        className={`group/item flex flex-col gap-3 p-3 rounded-xl bg-white border-2 transition-all hover:shadow-md ${isCurrent ? 'border-brand-bronze ring-1 ring-brand-bronze/10' : 'border-brand-bronze/5 hover:border-brand-bronze/20'}`}
                      >
                        <div className="relative aspect-square w-full shrink-0 rounded-lg overflow-hidden bg-brand-bronze/5 border border-brand-bronze/10">
                          {gp.mainImageUrl ? (
                            <Image 
                              src={gp.mainImageUrl} 
                              alt={gp.name["hu"]} 
                              fill 
                              className={`object-cover ${isCurrent ? 'opacity-100' : 'opacity-80 group-hover/item:opacity-100'} transition-all`}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                               <Award className="w-8 h-8 text-brand-bronze/20" />
                            </div>
                          )}
                          {isCurrent && (
                            <div className="absolute top-2 right-2 bg-brand-bronze text-white p-1 rounded-full shadow-sm z-10">
                               <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h5 className={`text-[11px] font-bold font-montserrat uppercase tracking-tight line-clamp-2 ${isCurrent ? 'text-brand-brown' : 'text-brand-black group-hover/item:text-brand-bronze'} transition-colors`}>
                            {gp.name["hu"]}
                          </h5>
                          {gp.shortDescription?.["hu"] && (
                            <p className="text-[10px] text-brand-black/50 line-clamp-2 leading-tight mt-1 font-montserrat">
                              {gp.shortDescription["hu"]}
                            </p>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-brand-bronze mt-2 flex items-center gap-1 uppercase tracking-widest">
                              <Check size={8} /> Jelenlegi
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Variációk */}
            {product.variants.length > 1 && (
              <div className="flex flex-col gap-4 mt-8">
                <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider border-b border-brand-bronze/10 pb-2">Méretek / Variációk</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((v, i) => (
                    <button 
                      key={v.id}
                      onClick={() => setActiveVariantId(v.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg text-center transition-all bg-white shadow-sm border ${activeVariantId === v.id ? 'border-[#d1a052] ring-1 ring-[#d1a052]/50' : 'border-brand-bronze/10 hover:border-brand-bronze/30'}`}
                    >
                      <div className="w-full aspect-[4/3] bg-[#f8f7f5] rounded flex items-center justify-center text-[10px] text-brand-black/40">
                         {v.sku ? v.sku.slice(0, 3).toUpperCase() : `V${i+1}`}
                      </div>
                      <span className="text-[10px] font-bold leading-tight line-clamp-2">
                        {v.sku ? v.sku : `Variáció ${i + 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Alsó szöveges leírás, ha a variációk megkövetelik a magyarázatot */}
            {/*<div className="mt-4 text-xs text-brand-black/70 leading-relaxed">
              Válassz a különböző variációk közül.
            </div>*/}

            </div> {/* Fő Oszlop Tartalom Vége */}
          </div>
        </div>

      </div>
    </div>
  </div>
);
}
