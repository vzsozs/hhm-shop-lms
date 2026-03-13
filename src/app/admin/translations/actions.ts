"use server";

import { getTranslationStatusProducts } from "@/modules/shop/queries";
import { db } from "@/db";
import { products } from "@/db/schema/shop";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function fetchTranslationStatus(filters: { 
  langMissing?: "hu" | "en" | "sk" | "all", 
  page: number, 
  limit: number 
}) {
  return await getTranslationStatusProducts(filters);
}

export async function toggleTranslationIgnore(productId: string, currentStatus: boolean) {
  try {
    await db
      .update(products)
      .set({ ignoreTranslationWarnings: !currentStatus })
      .where(eq(products.id, productId));
    
    revalidatePath("/admin/translations");
    return { success: true };
  } catch (error) {
    console.error("Error toggling translation ignore:", error);
    return { success: false, error: "Nem sikerült menteni a beállítást." };
  }
}
