"use client";

import { useTransition } from "react";
import { Copy, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deleteProduct, duplicateProduct } from "@/modules/shop/actions";

export function ProductActions({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Biztosan törölni szeretnéd ezt a terméket? Ez a művelet nem vonható vissza.")) {
      startTransition(async () => {
        const result = await deleteProduct(productId);
        if (result.success) {
          toast.success("Termék sikeresen törölve!");
        } else {
          toast.error(result.error || "Hiba történt a törlés során.");
        }
      });
    }
  };

  const handleDuplicate = () => {
    startTransition(async () => {
      const result = await duplicateProduct(productId);
      if (result.success) {
        toast.success("Termék sikeresen lemásolva (Piszkozatként)!");
      } else {
        toast.error(result.error || "Hiba történt a másolás során.");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link 
        href={`/admin/products/${productId}`} 
        className="p-2 text-white/50 hover:text-brand-orange bg-white/5 hover:bg-brand-orange/10 rounded-lg transition-all"
        title="Szerkesztés"
      >
        <Edit size={16} />
      </Link>
      <button 
        onClick={handleDuplicate} 
        disabled={isPending}
        className="p-2 text-white/50 hover:text-blue-400 bg-white/5 hover:bg-blue-400/10 rounded-lg transition-all disabled:opacity-50"
        title="Duplikálás"
      >
        <Copy size={16} />
      </button>
      <button 
        onClick={handleDelete} 
        disabled={isPending}
        className="p-2 text-white/50 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
        title="Törlés"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
