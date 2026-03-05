"use client";

import { useState } from "react";
import { ProductVariantItem } from "@/modules/shop/queries";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle, XCircle } from "lucide-react";

interface ProductVariantSelectorProps {
  variants: ProductVariantItem[];
  currency?: "HUF" | "EUR";
}

export function ProductVariantSelector({
  variants,
  currency = "HUF",
}: ProductVariantSelectorProps) {
  // Alapértelmezetten a legelső variánst választjuk ki (a lista már meglétét feltételezzük)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?.id || ""
  );

  if (!variants || variants.length === 0) {
    return <div className="text-destructive font-medium">Jelenleg nem elérhető.</div>;
  }

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];

  // Ár formázása
  const formatPrice = (price: number | null) => {
    if (price === null) return "Nincs ár megadva";
    return new Intl.NumberFormat(currency === "HUF" ? "hu-HU" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: currency === "HUF" ? 0 : 2,
    }).format(price);
  };

  const activePrice = currency === "HUF" ? selectedVariant.priceHuf : selectedVariant.priceEur;

  const handleAddToCart = () => {
    // TODO: Kosárba rakás logikája (Zustand vagy React Context alapján)
    alert(`Kosárba rakva: SKU: ${selectedVariant.sku}`);
  };

  return (
    <div className="space-y-6">
      {/* 1. Ár és Elérhetőség kijelzése */}
      <div>
        <h2 className="text-3xl font-bold mb-2 text-primary">
          {formatPrice(activePrice)}
        </h2>
        
        <div className="flex items-center gap-2 text-sm">
          {selectedVariant.stock > 0 ? (
            <span className="flex items-center text-green-600 gap-1 font-medium bg-green-50 px-2 py-1 rounded-md">
              <CheckCircle className="w-4 h-4" />
              Raktáron ({selectedVariant.stock} db)
            </span>
          ) : (
            <span className="flex items-center text-destructive gap-1 font-medium bg-destructive/10 px-2 py-1 rounded-md">
              <XCircle className="w-4 h-4" />
              Nincs raktáron
            </span>
          )}
          
          <span className="text-muted-foreground ml-2">
            Cikkszám: {selectedVariant.sku}
          </span>
        </div>
      </div>

      {/* 2. Variáns Választó (Csak ha több is van) */}
      {variants.length > 1 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">Válassz variánst:</Label>
          <RadioGroup
            value={selectedVariantId}
            onValueChange={setSelectedVariantId}
            className="grid gap-3"
          >
            {variants.map((v) => (
              <div key={v.id}>
                <RadioGroupItem
                  value={v.id}
                  id={v.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={v.id}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
                >
                  <div className="w-full flex justify-between items-center">
                    <span className="font-semibold text-base">{v.sku}</span>
                    <span className="text-muted-foreground font-medium">
                      {formatPrice(currency === "HUF" ? v.priceHuf : v.priceEur)}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* 3. Kosárba rakás gomb */}
      <Button 
        onClick={handleAddToCart} 
        size="lg" 
        className="w-full text-base"
        disabled={selectedVariant.stock <= 0}
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        Kosárba teszem
      </Button>

      {/* 4. Extra logisztika információ (opcionális, ha van kiterjedése) */}
      {selectedVariant.weight && (
        <p className="text-xs text-muted-foreground text-center">
          Várható szállítási súly: {selectedVariant.weight} kg
        </p>
      )}
    </div>
  );
}
