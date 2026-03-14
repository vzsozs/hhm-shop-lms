
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Award } from "lucide-react";
import { ProductDetailSubComponentProps } from "./product-detail-types";
import { renderValueWithLinks } from "./product-detail-utils";

interface ProductPriceActionsProps extends ProductDetailSubComponentProps {
  activeVariant: any;
  priceHuf: string | null;
  priceEur: string | null;
}

export const ProductPriceActions: React.FC<ProductPriceActionsProps> = ({
  product,
  lang,
  t,
  activeVariant,
  priceHuf,
  priceEur
}) => {
  return (
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

      <div className="mt-2">
        <Button className="w-full sm:w-auto px-8 h-12 text-sm bg-brand-bronze hover:bg-[#726251] text-white rounded-md shadow-md hover:shadow-lg transition-all duration-300 font-bold tracking-wider border border-transparent">
          {t.addToCart}
        </Button>
      </div>
    </div>
  );
};
