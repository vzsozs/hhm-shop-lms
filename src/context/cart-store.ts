import { create } from 'zustand';
import { persist } from 'zustand/middleware';


type ProductType = "physical" | "digital" | "meinl";

export interface CartItem {
  variantId: string;
  productId: string;
  name: Record<string, string>; // e.g. { hu: "Termék", en: "Product" }
  variantName?: Record<string, string> | null;
  priceHuf: number;
  priceEur: number;
  quantity: number;
  imageUrl?: string | null;
  type: ProductType;
  weight?: number | null; // For logistics/shipping calc
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.variantId === item.variantId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
              isOpen: true, // Auto-open cart when adding items
            };
          }
          return { 
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
            isOpen: true,
          };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      setIsOpen: (isOpen) => set({ isOpen }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'hhm-cart-storage', // name of the item in the storage (must be unique)
    }
  )
);
