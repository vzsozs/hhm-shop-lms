
import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { ProductDetailSubComponentProps } from "./product-detail-types";

interface ProductInfoProps extends ProductDetailSubComponentProps {
  activeVariantSku: string | null;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  lang, 
  t, 
  activeVariantSku 
}) => {
  return (
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

        {/* Badges - Mobile */}
        <div className="lg:hidden flex flex-row flex-wrap gap-2 mb-6">
          {product.badges && product.badges.length > 0 && (
            product.badges.map((badge, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-bronze/20 bg-white/50 text-[10px] font-bold text-brand-brown uppercase tracking-widest shadow-sm"
              >
                <div className="relative w-4 h-4 rounded-full overflow-hidden">
                  <Image
                    src={`/assets/badges/${badge.icon}`}
                    alt={badge.icon}
                    fill
                    className="object-cover"
                  />
                </div>
                <span>{badge.tooltip?.[lang] || badge.tooltip?.["hu"] || ""}</span>
              </div>
            ))
          )}
        </div>

        <p className="text-brand-black/40 text-[11px] font-bold uppercase tracking-widest mb-4">
          {t.skuPrefix}: {activeVariantSku || "–"}
        </p>
      </div>

      {/* Features List */}
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
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};
