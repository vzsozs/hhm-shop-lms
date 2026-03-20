"use client";

import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/context/cart-store";
import { ShoppingCart } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>;
  className?: string;
}

export function AddToCartButton({ item, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { language } = useLanguage();

  return (
    <Button 
      onClick={(e) => {
        e.preventDefault(); // In case it's inside a Link
        addItem(item);
      }}
      className={`gap-2 ${className}`}
    >
      <ShoppingCart className="w-4 h-4" />
      {language === 'hu' ? 'Kosárba' : language === 'en' ? 'Add to Cart' : 'Do košíka'}
    </Button>
  );
}
