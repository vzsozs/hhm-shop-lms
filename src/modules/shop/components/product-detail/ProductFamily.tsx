
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Award } from "lucide-react";
import { ProductDetailSubComponentProps } from "./product-detail-types";

interface ProductFamilyProps extends ProductDetailSubComponentProps {
  showAllFamily: boolean;
  setShowAllFamily: (show: boolean) => void;
}

export const ProductFamily: React.FC<ProductFamilyProps> = ({
  product,
  lang,
  t,
  showAllFamily,
  setShowAllFamily
}) => {
  if (!product.groupProducts || product.groupProducts.length <= 1) return null;

  return (
    <div className="flex flex-col gap-4 mt-6">
      <div className="flex items-center justify-between border-b border-brand-bronze/10 pb-2">
        <h4 className="font-bold text-brand-black text-sm uppercase tracking-wider">{t.otherFamilyMembers}</h4>
        <span className="text-[10px] text-brand-black/40 font-medium bg-brand-bronze/5 px-2 py-0.5 rounded">{product.groupProducts.length} {t.item}</span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {(() => {
          const sortedMembers = [...product.groupProducts].sort((a, b) => {
            const skuA = a.sku || "";
            const skuB = b.sku || "";
            return skuA.localeCompare(skuB);
          });
          
          const limit = 6;
          const visibleMembers = showAllFamily ? sortedMembers : sortedMembers.slice(0, limit);
          
          return visibleMembers.map((gp) => {
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
            );
          });
        })()}
      </div>
      
      {product.groupProducts.length > 6 && !showAllFamily && (
        <button 
          onClick={() => setShowAllFamily(true)}
          className="mt-2 text-[10px] font-bold text-brand-bronze hover:text-brand-brown uppercase tracking-[0.2em] flex items-center justify-center gap-2 py-2 border border-brand-bronze/10 rounded-lg bg-brand-bronze/5 transition-colors"
        >
          {t.showMore}
        </button>
      )}
    </div>
  );
};
