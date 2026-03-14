
import React from "react";
import { Check } from "lucide-react";
import { ProductDetailSubComponentProps } from "./product-detail-types";
import { renderValueWithLinks } from "./product-detail-utils";

interface ProductTabsProps extends ProductDetailSubComponentProps {
  activeTab: "specs" | "look";
  setActiveTab: (tab: "specs" | "look") => void;
  activeVariant: any;
  sanitizedLongDescription: string | null;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  product,
  lang,
  t,
  activeTab,
  setActiveTab,
  activeVariant,
  sanitizedLongDescription
}) => {
  return (
    <div className="mt-4">
      <div className="flex border-b border-brand-bronze/20 mb-6 font-cormorant overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab("specs")}
          className={`py-3 px-6 font-bold text-medium sm:text-2xl tracking-widest transition-colors border-b-2 uppercase whitespace-nowrap ${activeTab === "specs" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
        >
          {t.features}
        </button>
        <button 
          onClick={() => setActiveTab("look")}
          className={`py-3 px-6 font-bold text-medium sm:text-2xl tracking-widest transition-colors border-b-2 uppercase whitespace-nowrap ${activeTab === "look" ? "border-brand-bronze text-brand-brown" : "border-transparent text-brand-black/50 hover:text-brand-black"}`}
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
                        <div className="flex-1 text-sm font-medium break-words overflow-hidden">
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
        <h2 className="text-2xl md:text-3xl font-cormorant font-bold text-brand-brown mb-6 uppercase tracking-widest">{t.detailedDescription}</h2>
        <div className="prose prose-stone max-w-none font-montserrat text-brand-black/80 leading-loose">
          {sanitizedLongDescription ? (
            <div dangerouslySetInnerHTML={{ __html: sanitizedLongDescription }} />
          ) : (
            <p className="italic">{t.noDescription}</p>
          )}
        </div>
      </div>
    </div>
  );
};
