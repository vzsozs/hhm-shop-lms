"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ProductDetailItem } from "@/modules/shop/queries";
import { Button } from "@/components/ui/button";
import { Award, Check, ExternalLink, ArrowLeft, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useRef, useEffect } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Language } from "@/modules/shared/lib/i18n-constants";

export function ProductDetailClient({ product, lang }: { product: ProductDetailItem; lang: Language }) {
  const dict: Record<Language, Record<string, string>> = {
    hu: {
      backToProducts: "Vissza a termékekhez",
      features: "Jellemzők",
      dimensions: "Méretek és Súly",
      noSpecs: "Nincsenek specifikációk rögzítve.",
      weight: "Súly",
      dimensionsLabel: "Méretek (Szé x Ma x Mé)",
      noDimensions: "Nincsenek méretek megadva ehhez a variációhoz.",
      detailedDescription: "Részletes leírás",
      noDescription: "Nincs elérhető leírás ehhez a termékhez.",
      premiumQuality: "Prémium Minőség",
      original: "Eredeti",
      featuredOffer: "Kiemelt Ajánlat",
      productLine: "Termékcsalád",
      skuPrefix: "Cikkszám",
      priceNotAvailable: "Ár nem elérhető",
      addToCart: "Kosárba rakom",
      listenAudio: "Hangminta hallgatása",
      otherFamilyMembers: "A család további tagjai",
      currentProduct: "Jelenlegi",
      variants: "Méretek / Variációk",
      noImage: "Nincs kép",
      item: "termék",
      variation: "Variáció"
    },
    en: {
      backToProducts: "Back to products",
      features: "Features",
      dimensions: "Dimensions and Weight",
      noSpecs: "No specifications recorded.",
      weight: "Weight",
      dimensionsLabel: "Dimensions (W x H x D)",
      noDimensions: "No dimensions specified for this variant.",
      detailedDescription: "Detailed description",
      noDescription: "No description available for this product.",
      premiumQuality: "Premium Quality",
      original: "Original",
      featuredOffer: "Featured Offer",
      productLine: "Product Line",
      skuPrefix: "SKU",
      priceNotAvailable: "Price not available",
      addToCart: "Add to cart",
      listenAudio: "Listen to sample",
      otherFamilyMembers: "Other members of the family",
      currentProduct: "Current",
      variants: "Sizes / Variations",
      noImage: "No image",
      item: "item",
      variation: "Variation"
    },
    sk: {
      backToProducts: "Späť na produkty",
      features: "Vlastnosti",
      dimensions: "Rozmery a hmotnosť",
      noSpecs: "Žiadne špecifikácie nie sú zaznamenané.",
      weight: "Hmotnosť",
      dimensionsLabel: "Rozmery (Š x V x H)",
      noDimensions: "Pre tento variant nie sú zadané žiadne rozmery.",
      detailedDescription: "Podrobný popis",
      noDescription: "Pre tento produkt nie je k dispozícii žiadny popis.",
      premiumQuality: "Prémiová kvalita",
      original: "Originál",
      featuredOffer: "Špeciálna ponuka",
      productLine: "Produktový rad",
      skuPrefix: "Kód",
      priceNotAvailable: "Cena nie je k dispozícii",
      addToCart: "Vložiť do košíka",
      listenAudio: "Vypočuť si ukážku",
      otherFamilyMembers: "Ďalší členovia rodiny",
      currentProduct: "Aktuálny",
      variants: "Veľkosti / Varianty",
      noImage: "Žiadny obrázok",
      item: "položka",
      variation: "Variant"
    }
  };

  const t = dict[lang] || dict.hu;
  const [activeTab, setActiveTab] = useState<"specs" | "look">("specs");
  const [activeImageId, setActiveImageId] = useState(product.media[0]?.id);
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0]?.id);
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const activeImage = product.media.find(m => m.id === activeImageId) || product.media[0];
  const audioMedia = product.media.find(m => m.type === "AUDIO");
  const visualMedia = product.media.filter(m => m.type !== "AUDIO");
  const activeVariant = product.variants.find(v => v.id === activeVariantId) || product.variants[0];

  const priceHuf = activeVariant?.priceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(activeVariant.priceHuf) : null;
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

  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("/embed/")) {
      videoId = url.split("/embed/")[1]?.split("?")[0];
    }
    return videoId || null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  };

  const localizedLongDescription = product.longDescription?.[lang] || product.longDescription?.hu;
  const sanitizedLongDescription = localizedLongDescription
    ? DOMPurify.sanitize(localizedLongDescription, { 
        ADD_ATTR: ["target", "rel"],
        FORBID_TAGS: ["script", "style", "iframe"],
      }) 
    : null;

  const toggleSidebarPlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };
  return (
    <div className="relative min-h-screen bg-brand-lightbg pt-12 pb-24">
      {/* Background Mandala Container - Fixes sticky overflow issue */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] w-[80%] max-w-[900px] opacity-10 rotate-12">
          <Image src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg" alt="Mandala textúra" width={900} height={900} className="w-full h-auto" style={{ height: 'auto' }} />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-brand-black/60 hover:text-brand-bronze transition-colors font-montserrat text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t.backToProducts}
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 xl:gap-16">
        
        {/* Bal Oszlop - 60% */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          {/* Fő Kép és Galéria */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-[#ffffff] rounded-2xl overflow-hidden relative border border-brand-bronze/10">
              {activeImage?.url ? (
                activeImage.type === "YOUTUBE" ? (
                  <iframe 
                    src={getYouTubeEmbedUrl(activeImage.url) || ""}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Product Video"
                  />
                ) : (
                  <Image 
                    src={activeImage.url} 
                    alt={product.name[lang] || product.name["hu"] || t.noImage} 
                    fill 
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority
                  />
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-brand-black/40 font-montserrat">{t.noImage}</div>
              )}
            </div>
            
            {/* Thumbnails */}
            {visualMedia.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {visualMedia.map(media => (
                  <button 
                    key={media.id}
                    onClick={() => setActiveImageId(media.id)}
                    className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImageId === media.id ? 'border-brand-bronze shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <Image 
                      src={media.type === "YOUTUBE" ? getYouTubeThumbnail(media.url) || media.url : media.url} 
                      alt="Thumbnail" 
                      fill 
                      className="object-contain" 
                    />
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

          {/* Tabs: Specs & Look */}
          <div className="mt-4">
            <div className="flex border-b border-brand-bronze/20 mb-6 font-cormorant">
              <button 
                onClick={() => setActiveTab("specs")}
                className={`py-3 px-6 font-bold text-2xl tracking-widest transition-colors border-b-2 uppercase ${activeTab === "specs" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
              >
                {t.features}
              </button>
              <button 
                onClick={() => setActiveTab("look")}
                className={`py-3 px-6 font-bold text-2xl tracking-widest transition-colors border-b-2 uppercase ${activeTab === "look" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
              >
                {t.dimensions}
              </button>
            </div>
            
            <div className="min-h-[200px] font-montserrat text-brand-black/80 bg-white/40 p-6 rounded-2xl border border-brand-bronze/10 shadow-sm">
              {activeTab === "specs" && (
                <div>
                   {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                     <ul className="space-y-4">
                       {(() => {
                         const specs = product.specifications as Array<{ key_hu: string; key_en: string; key_sk: string; value_hu: string; value_en: string; value_sk: string }>;
                         // USP-ket előre, a többit utána
                         const sortedSpecs = [...specs].sort((a, b) => {
                           const aIsUsp = a.key_en?.startsWith("USP") || a.key_hu?.startsWith("USP");
                           const bIsUsp = b.key_en?.startsWith("USP") || b.key_hu?.startsWith("USP");
                           if (aIsUsp && !bIsUsp) return -1;
                           if (!aIsUsp && bIsUsp) return 1;
                           return 0;
                         });

                         return sortedSpecs.map((spec, i) => {
                           const isUsp = spec.key_en?.startsWith("USP") || spec.key_hu?.startsWith("USP");
                           const key = (spec as Record<string, string>)[`key_${lang}`] || spec.key_hu || spec.key_en || `${t.features} ${i + 1}`;
                           const val = (spec as Record<string, string>)[`value_${lang}`] || spec.value_hu || spec.value_en || "–";
                           
                           return (
                             <li key={i} className="flex gap-3 items-center">
                               <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                                 <Check className="w-3.5 h-3.5 text-brand-brown" />
                               </div>
                               <div className="flex-1 text-sm font-medium">
                                 {!isUsp && <strong className="text-brand-brown">{key}: </strong>}
                                 {renderValueWithLinks(val)}
                               </div>
                             </li>
                           );
                         });
                       })()}
                     </ul>
                   ) : (
                     <p className="italic text-brand-black/50">{t.noSpecs}</p>
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
                          <span><strong>{t.weight}:</strong> {activeVariant.weight} g</span>
                        </li>
                      )}
                      {activeVariant?.width && activeVariant?.height && activeVariant?.depth && (
                         <li className="flex gap-3 items-center">
                          <div className="w-6 h-6 rounded-full bg-brand-bronze/20 flex items-center justify-center shrink-0">
                            <div className="w-2 h-2 rounded-full bg-brand-brown"></div>
                          </div>
                          <span><strong>{t.dimensionsLabel}:</strong> {activeVariant.width} x {activeVariant.height} x {activeVariant.depth} cm</span>
                        </li>
                      )}
                      {!activeVariant?.weight && !activeVariant?.width && <p>{t.noDimensions}</p>}
                   </ul>
                </div>
              )}
            </div>

            {/* Long Description */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 lg:p-10 border border-brand-bronze/20 shadow-sm mt-4">
              <h2 className="text-3xl font-cormorant font-bold text-brand-brown mb-6 uppercase tracking-widest">{t.detailedDescription}</h2>
              <div className="prose prose-stone max-w-none font-montserrat text-brand-black/80 leading-loose">
                {sanitizedLongDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }} />
                ) : (
                  <p className="italic">{t.noDescription}</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Jobb Oszlop - 40% - Sticky Card */}
        <div className="w-full lg:w-[40%] text-brand-black relative z-10 lg:pl-10">
          <div className="lg:sticky lg:top-32 flex flex-row gap-4 lg:gap-6 font-montserrat">
            
            {/* Dinamikus Badge-ek */}
            <div className="flex flex-col gap-3 pt-2 shrink-0">
              {product.badges && product.badges.length > 0 && (
                product.badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="w-8 h-8 rounded-full border border-brand-bronze/30 flex items-center justify-center text-brand-brown bg-[#f8f7f5] shadow-sm transform hover:scale-110 transition-all group relative cursor-help overflow-visible" 
                  >
                    <div className="relative w-8 h-8 z-10 rounded-full overflow-hidden">
                      <Image
                        src={`/assets/badges/${badge.icon}`}
                        alt={badge.icon}
                        fill
                        className="object-cover"
                      />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-brand-black/90 backdrop-blur-md border border-brand-orange/30 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[60] shadow-xl uppercase tracking-wider font-bold">
                      {badge.tooltip?.[lang] || badge.tooltip?.["hu"] || ""}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-orange/30" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Fő Oszlop Tartalom */}
            <div className="flex flex-col gap-6 w-full">
               <div className="flex flex-col gap-1">
                {product.group && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-bronze bg-brand-bronze/5 px-2 py-0.5 rounded border border-brand-bronze/10">
                      {product.group.name[lang] || product.group.name["hu"]} {t.productLine}
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-2 font-montserrat">
                  {product.categories.map((c) => (
                    <span key={c.id} className="text-[10px] font-bold tracking-widest uppercase text-brand-brown/80 bg-brand-bronze/10 px-2 py-1 flex items-center gap-1 rounded-sm">
                      {c.name[lang] || c.name["hu"] || c.slug[lang] || c.slug["hu"]}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h1 className="font-montserrat text-lg lg:text-2xl font-bold text-brand-black tracking-widest uppercase leading-tight">
                    {product.name[lang] || product.name["hu"] || t.unnamedProduct}
                  </h1>
                </div>
                <p className="text-brand-black/40 text-[11px] font-bold uppercase tracking-widest mb-4">
                  {t.skuPrefix}: {activeVariant?.sku || "–"}
                </p>
              </div>

            {/* Felső Rövid Ismertető Pipa Pontokkal */}
            <div className="text-brand-black/80 text-sm space-y-2 pb-4">
              {product.shortDescription?.[lang] || product.shortDescription?.["hu"] ? (
                 <div className="whitespace-pre-line leading-relaxed flex flex-col gap-3">
                   {(product.shortDescription[lang] || product.shortDescription["hu"]).split("\n").map((line: string, i: number) => {
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
                 <p className="text-sm italic"></p>
              )}
            </div>

            {/* Ár és Termék Jellemzők */}
            <div className="flex flex-col gap-3 mt-2">
               <div className="flex flex-col gap-0.5">
                 {lang === "hu" ? (
                   <>
                     {priceHuf && <div className="text-3xl font-bold text-brand-black">{priceHuf}</div>}
                     {priceEur && <div className="text-lg text-brand-black/50 font-medium">{priceEur}</div>}
                   </>
                 ) : (
                   <>
                     {priceEur && <div className="text-3xl font-bold text-brand-black">{priceEur}</div>}
                   </>
                 )}
                 {((lang === "hu" && !priceHuf && !priceEur) || (lang !== "hu" && !priceEur)) && (
                   <div className="text-xl font-bold text-brand-black italic">{t.priceNotAvailable}</div>
                 )}
               </div>

               {/* Specifikációk kistábla formátumban */}
               {/* USP-k vagy Specifikációk kistábla formátumban */}
               {Array.isArray(product.specifications) && product.specifications.length > 0 && (
                 <div className="flex flex-col gap-0.5 mt-2 text-xs text-brand-black">
                   {(() => {
                     const specs = product.specifications as Array<{ key_en: string; key_hu: string; value_en: string; value_hu: string }>;
                     const usps = specs.filter(s => s.key_en?.startsWith("USP") || s.key_hu?.startsWith("USP")).slice(0, 5);
                     
                     if (usps.length > 0) {
                       return usps.map((usp, i) => (
                         <div key={i} className="flex gap-2 items-center">
                           <Check className="w-3.5 h-3.5 text-brand-black/60 shrink-0" />
                           <span className="font-bold">{renderValueWithLinks((usp as Record<string, string>)[`value_${lang}`] || usp.value_hu || usp.value_en)}</span>
                         </div>
                       ));
                     }

                     return specs.slice(0, 3).map((spec, i) => {
                       const key = (spec as Record<string, string>)[`key_${lang}`] || spec.key_hu || spec.key_en || `${t.features} ${i + 1}`;
                       const val = (spec as Record<string, string>)[`value_${lang}`] || spec.value_hu || spec.value_en || "–";
                       return (
                         <div key={i} className="flex gap-2 items-center">
                           <Award className="w-3.5 h-3.5 text-brand-black/60 shrink-0" />
                           <span className="capitalize text-brand-black/60">{key}:</span>
                           <span className="font-bold">{renderValueWithLinks(val)}</span>
                         </div>
                       );
                     });
                   })()}
                 </div>
               )}
            </div>

            {/* Kosárba gomb */}
            <div className="mt-2">
              <Button className="w-full sm:w-auto px-8 h-12 text-sm bg-brand-bronze hover:bg-[#726251] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 font-bold tracking-wider border border-transparent">
                {t.addToCart}
              </Button>
            </div>

            {/* Audio Player Component */}
            {audioMedia && (
              <div className="mt-4 p-4 bg-white/60 backdrop-blur-md rounded-xl border border-brand-bronze/10 shadow-sm flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={toggleSidebarPlay}
                    className="w-10 h-10 rounded-full bg-brand-bronze text-white flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-brand-bronze uppercase tracking-widest">{t.listenAudio}</span>
                    <input 
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-brand-bronze/20 rounded-lg appearance-none cursor-pointer accent-brand-bronze"
                    />
                    <div className="flex justify-between text-[9px] font-medium text-brand-black/60">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 border-l border-brand-bronze/10">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-brand-brown/60 hover:text-brand-brown">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="w-12 h-1 bg-brand-bronze/20 rounded-lg appearance-none cursor-pointer accent-brand-bronze hidden sm:block"
                    />
                  </div>
                </div>
                
                <audio 
                  ref={audioRef}
                  src={audioMedia.url}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  muted={isMuted}
                  autoPlay={false}
                  className="hidden"
                />
              </div>
            )}

            {/* Termékcsalád tagjai (Kártyás megjelenítés) */}
            {product.groupProducts && product.groupProducts.length > 1 && (
              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center justify-between border-b border-brand-bronze/10 pb-2">
                  <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider">{t.otherFamilyMembers}</h4>
                  <span className="text-[10px] text-brand-black/40 font-medium bg-brand-bronze/5 px-2 py-0.5 rounded">{product.groupProducts.length} {t.item}</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.groupProducts.map((gp) => {
                    const isCurrent = gp.id === product.id;
                    return (
                      <Link 
                        key={gp.id}
                        href={`/products/${gp.slug[lang] || gp.slug["hu"]}`}
                        className={`group/item flex flex-col gap-3 p-3 rounded-xl bg-white border-2 transition-all hover:shadow-md ${isCurrent ? 'border-brand-bronze ring-1 ring-brand-bronze/10' : 'border-brand-bronze/5 hover:border-brand-bronze/20'}`}
                      >
                        <div className="relative aspect-square w-full shrink-0 rounded-lg overflow-hidden bg-brand-bronze/5 border border-brand-bronze/10">
                          {gp.mainImageUrl ? (
                            <Image 
                              src={gp.mainImageUrl} 
                              alt={gp.name[lang] || gp.name["hu"]} 
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
                            {gp.name[lang] || gp.name["hu"]}
                          </h5>
                          {(gp.shortDescription?.[lang] || gp.shortDescription?.["hu"]) && (
                            <p className="text-[10px] text-brand-black/50 line-clamp-2 leading-tight mt-1 font-montserrat">
                              {gp.shortDescription[lang] || gp.shortDescription["hu"]}
                            </p>
                          )}
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-brand-bronze mt-2 flex items-center gap-1 uppercase tracking-widest">
                              <Check size={8} /> {t.currentProduct}
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
                <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider border-b border-brand-bronze/10 pb-2">{t.variants}</h4>
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
                        {v.sku ? v.sku : `${t.variation} ${i + 1}`}
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
