"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductDetailItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { Award, Shield, Star, Check } from "lucide-react"; 

export function ProductDetailClient({ product }: { product: ProductDetailItem }) {
  const [activeTab, setActiveTab] = useState<"specs" | "look">("specs");
  const [activeImageId, setActiveImageId] = useState(product.media[0]?.id);
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0]?.id);
  
  const activeImage = product.media.find(m => m.id === activeImageId) || product.media[0];
  const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];

  const priceHuf = activeVariant?.priceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF' }).format(activeVariant.priceHuf) : null;
  const priceEur = activeVariant?.priceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(activeVariant.priceEur) : null;

  return (
    <div className="relative min-h-screen bg-brand-lightbg pt-12 pb-24">
      {/* Background Mandala Container - Fixes sticky overflow issue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] w-[80%] max-w-[900px] opacity-10 rotate-12">
          <Image src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg" alt="Mandala textúra" width={900} height={900} className="w-full h-auto" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col lg:flex-row gap-8 xl:gap-16">
        
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
            <div className="prose prose-brand max-w-none font-montserrat text-brand-black/80 leading-loose">
              {product.longDescription && product.longDescription["hu"] ? (
                 <div dangerouslySetInnerHTML={{ __html: product.longDescription["hu"] }} />
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
                   {product.specifications ? (
                     <ul className="space-y-4">
                       {Object.entries(product.specifications).map(([key, val]) => (
                         <li key={key} className="flex gap-3 items-center">
                           <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                             <Check className="w-3.5 h-3.5 text-brand-brown" />
                           </div>
                           <span><strong className="capitalize">{key}:</strong> {String(val)}</span>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p>Nincsenek specifikációk rögzítve.</p>
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
              {/* Főcím és Kategória */}
              <div className="flex flex-col gap-1">
               {product.categories.length > 0 && (
                 <h2 className="font-cormorant text-2xl lg:text-3xl font-bold text-[#d1a052] uppercase tracking-wider leading-tight">
                   {product.categories[0].name["hu"] || product.categories[0].slug["hu"]}
                 </h2>
               )}
               <h1 className="font-montserrat text-lg lg:text-xl font-bold text-brand-black tracking-widest uppercase leading-tight mb-4">
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
               {product.specifications && Object.keys(product.specifications).length > 0 && (
                 <div className="flex flex-col gap-0.5 mt-2 text-xs text-brand-black">
                   {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                     <div key={key} className="flex gap-2 items-center">
                       <Award className="w-3.5 h-3.5 text-brand-black/60 shrink-0" />
                       <span className="capitalize text-brand-black/60">{key}:</span> 
                       <span className="font-bold">{String(val)}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>

            {/* Kosárba gomb */}
            <div className="mt-2">
              <Button className="w-full sm:w-auto px-8 h-12 text-sm bg-brand-bronze hover:bg-[#726251] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 font-bold tracking-wider border border-transparent">
                Kosárba rakom
              </Button>
            </div>

            {/* Variációk */}
            {product.variants.length > 1 && (
              <div className="flex flex-col gap-4 mt-6">
                <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider border-b border-brand-bronze/10 pb-2">Variációk</h4>
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
                      {v.weight && (
                        <span className="text-[9px] text-brand-black/60">
                          {v.weight} kg
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Alsó szöveges leírás, ha a variációk megkövetelik a magyarázatot */}
            <div className="mt-4 text-xs text-brand-black/70 leading-relaxed">
              Minden variációhoz egyedi paraméterek tartoznak. Válaszd ki a neked legmegfelelőbbet a fenti opciók közül.
            </div>

            </div> {/* Fő Oszlop Tartalom Vége */}
          </div>
        </div>

      </div>
    </div>
  );
}
