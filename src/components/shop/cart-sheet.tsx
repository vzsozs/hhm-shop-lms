"use client";

import { useCartStore } from "@/context/cart-store";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useLanguage } from "@/context/language-context";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartSheet() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem } = useCartStore();
  const { language } = useLanguage();
  const router = useRouter();

  const isEuros = language === "en" || language === "sk";
  
  const totalPrice = items.reduce((total, item) => {
    const itemPrice = isEuros ? item.priceEur : item.priceHuf;
    return total + itemPrice * item.quantity;
  }, 0);

  const formatPrice = (price: number) => {
    if (isEuros) {
      return new Intl.NumberFormat(language === "en" ? "en-US" : "sk-SK", { style: "currency", currency: "EUR" }).format(price);
    }
    return new Intl.NumberFormat("hu-HU", { style: "currency", currency: "HUF", maximumFractionDigits: 0 }).format(price);
  };

  const handleCheckout = () => {
    setIsOpen(false);
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {language === 'hu' ? 'Kosaram' : language === 'en' ? 'My Cart' : 'Môj košík'}
          </SheetTitle>
          <SheetDescription className="sr-only">Bevásárlókosár tartalma</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p className="text-sm font-medium">
                {language === 'hu' ? 'A kosarad jelenleg üres.' : language === 'en' ? 'Your cart is empty.' : 'Váš košík je prázdny.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 items-center bg-zinc-50 border p-3 rounded-xl border-zinc-100 shadow-sm">
                  {item.imageUrl && (
                    <div className="w-16 h-16 relative flex-shrink-0 bg-white rounded-md border border-zinc-100 overflow-hidden">
                      <Image src={item.imageUrl} alt={item.name[language] || item.name['hu']} fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1 text-sm">
                    <h4 className="font-bold line-clamp-1">{item.name[language] || item.name['hu']}</h4>
                    {item.variantName && (
                      <p className="text-zinc-500 text-xs mt-0.5">{item.variantName[language] || item.variantName['hu']}</p>
                    )}
                    <div className="font-semibold mt-1.5 text-orange-950">
                      {formatPrice(isEuros ? item.priceEur : item.priceHuf)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 text-zinc-600">
                    <button onClick={() => removeItem(item.variantId)} className="rounded-full p-1.5 bg-white border border-zinc-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center bg-white rounded-lg border border-zinc-200 shadow-sm text-sm overflow-hidden font-medium">
                      <button 
                        onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="px-2.5 py-1.5 hover:bg-zinc-100 text-zinc-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-6 border-t mt-auto">
            <div className="flex justify-between items-center font-bold text-xl mb-6">
              <span className="text-zinc-600">{language === 'hu' ? 'Összesen' : language === 'en' ? 'Total' : 'Spolu'}:</span>
              <span className="text-orange-950">{formatPrice(totalPrice)}</span>
            </div>
            <Button onClick={handleCheckout} className="w-full h-12 text-md font-semibold bg-orange-900 hover:bg-orange-800 text-orange-50 rounded-xl" size="lg">
              {language === 'hu' ? 'Tovább a fizetéshez' : language === 'en' ? 'Checkout' : 'Pokladňa'}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
