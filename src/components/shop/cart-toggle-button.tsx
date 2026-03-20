"use client";
import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/context/cart-store';
import Image from 'next/image';

interface CartToggleButtonProps {
  className?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export function CartToggleButton({ className, imageWidth = 20, imageHeight = 20 }: CartToggleButtonProps) {
  const [mounted, setMounted] = useState(false);
  const toggleCart = useCartStore(state => state.toggleCart);
  const items = useCartStore(state => state.items);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  // getTotalItems beállítása
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button onClick={toggleCart} className={`relative ${className}`}>
      <Image src="/assets/icons-cart.svg" width={imageWidth} height={imageHeight} className="h-auto w-auto" alt="Cart"/>
      {mounted && itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-[#ad4d2a] text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-[3px] shadow">
          {itemCount}
        </span>
      )}
    </button>
  );
}
