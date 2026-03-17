
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { ProductDetailItem } from "@/modules/shop/queries";
import { Language } from "@/modules/shared/lib/i18n-constants";

import { PRODUCT_DETAIL_DICT } from "./product-detail/product-detail-dict";
import { ProductGallery } from "./product-detail/ProductGallery";
import { ProductInfo } from "./product-detail/ProductInfo";
import { ProductPriceActions } from "./product-detail/ProductPriceActions";
import { ProductAudioPlayer } from "./product-detail/ProductAudioPlayer";
import { ProductFamily } from "./product-detail/ProductFamily";
import { ProductTabs } from "./product-detail/ProductTabs";

export function ProductDetailClient({ product, lang }: { product: ProductDetailItem; lang: Language }) {
  const t = PRODUCT_DETAIL_DICT[lang] || PRODUCT_DETAIL_DICT.hu;
  
  const [activeTab, setActiveTab] = useState<"specs" | "look">("specs");
  const [activeImageId, setActiveImageId] = useState(product.media[0]?.id);
  const [activeVariantId, setActiveVariantId] = useState(product.variants[0]?.id);
  const [showAllFamily, setShowAllFamily] = useState(false);
  
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

  const activeVariant = useMemo(() => 
    product.variants.find(v => v.id === activeVariantId) || product.variants[0],
    [product.variants, activeVariantId]
  );
  
  const audioMedia = useMemo(() => 
    product.media.find(m => m.type === "AUDIO"),
    [product.media]
  );

  const priceHuf = useMemo(() => 
    activeVariant?.priceHuf ? new Intl.NumberFormat('hu-HU', { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(activeVariant.priceHuf) : null,
    [activeVariant]
  );
  
  const priceEur = useMemo(() => 
    activeVariant?.priceEur ? new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(activeVariant.priceEur) : null,
    [activeVariant]
  );

  const sanitizedLongDescription = useMemo(() => {
    const localizedLongDescription = product.longDescription?.[lang] || product.longDescription?.hu;
    return localizedLongDescription
      ? DOMPurify.sanitize(localizedLongDescription, { 
          ADD_ATTR: ["target", "rel"],
          FORBID_TAGS: ["script", "style", "iframe"],
        }) 
      : null;
  }, [product.longDescription, lang]);

  const togglePlay = () => {
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
      {/* Background Mandala Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] right-[-10%] w-[80%] max-w-[900px] opacity-10 rotate-12">
          <Image src="/assets/PalAdri-logo-2023-Vegleges-Lezer-light.svg" alt="Mandala textúra" width={900} height={900} className="w-full h-auto" />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-6">
          <Link 
            href="/shop" 
            className="inline-flex items-center gap-2 text-brand-black/60 hover:text-brand-bronze transition-colors font-montserrat text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t.backToProducts}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 xl:gap-16">
          {/* Gallery Column */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-1 order-1 flex flex-col gap-8">
            <ProductGallery 
              product={product} 
              lang={lang} 
              t={t} 
              activeImageId={activeImageId} 
              setActiveImageId={setActiveImageId} 
            />
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 lg:col-start-7 lg:row-start-1 lg:row-span-2 order-2 lg:order-last w-full text-brand-black relative z-10 lg:pl-10">
            <div className="lg:sticky lg:top-32 lg:self-start flex flex-row gap-4 lg:gap-6 font-montserrat">
              
              {/* Badges - Desktop */}
              <div className="hidden lg:flex flex-col gap-3 pt-2 shrink-0">
                {product.badges?.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="w-8 h-8 rounded-full border border-brand-bronze/30 flex items-center justify-center text-brand-brown bg-[#f8f7f5] shadow-sm transform hover:scale-110 transition-all group relative cursor-help overflow-visible" 
                  >
                    <div className="relative w-8 h-8 z-10 rounded-full overflow-hidden">
                      <Image src={`/assets/badges/${badge.icon}`} alt={badge.icon} fill className="object-cover" />
                    </div>
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-brand-black/90 backdrop-blur-md border border-brand-orange/30 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[60] shadow-xl uppercase tracking-wider font-bold">
                      {badge.tooltip?.[lang] || badge.tooltip?.["hu"] || ""}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-orange/30" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Info & Purchase */}
              <div className="flex flex-col gap-6 w-full">
                <ProductInfo 
                  product={product} 
                  lang={lang} 
                  t={t} 
                  activeVariantSku={activeVariant?.sku} 
                />
                
                <ProductPriceActions 
                  product={product} 
                  lang={lang} 
                  t={t} 
                  activeVariant={activeVariant} 
                  priceHuf={priceHuf} 
                  priceEur={priceEur} 
                />

                <ProductAudioPlayer 
                  product={product}
                  lang={lang}
                  t={t}
                  audioMedia={audioMedia}
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  togglePlay={togglePlay}
                  currentTime={currentTime}
                  duration={duration}
                  handleSeek={handleSeek}
                  volume={volume}
                  setVolume={setVolume}
                  isMuted={isMuted}
                  setIsMuted={setIsMuted}
                  onTimeUpdate={onTimeUpdate}
                  onLoadedMetadata={onLoadedMetadata}
                  setIsPlaying={setIsPlaying}
                  formatTime={formatTime}
                />

                <ProductFamily 
                  product={product} 
                  lang={lang} 
                  t={t} 
                  showAllFamily={showAllFamily} 
                  setShowAllFamily={setShowAllFamily} 
                />

                {/* Variant Selector */}
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
              </div>
            </div>
          </div>

          {/* Specifications & Tabs Column */}
          <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 order-3 lg:order-2">
            <ProductTabs 
              product={product} 
              lang={lang} 
              t={t} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              activeVariant={activeVariant} 
              sanitizedLongDescription={sanitizedLongDescription} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
