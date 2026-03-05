"use server";

import { db } from "@/db";
import { products, productVariants, productMedia } from "@/db/schema/shop";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProductServerSchema, CreateProductPayload } from "./schemas"; // <--- Import a központi sémából

export async function createProduct(formData: CreateProductPayload) {
  try {
    // Szigorú szerveroldali validálás a központosított sémával
    const validated = createProductServerSchema.parse(formData);

    // Tranzakció indítása az inkonzisztenciák elkerülésére
    const result = await db.transaction(async (tx) => {
      // 1. Termék létrehozása a Products táblában (JSONB nevekkel és leírásokkal)
      const [newProduct] = await tx
        .insert(products)
        .values({
          name: validated.name as any, // Drizzle type inference workaround JSONB-re
          description: validated.description as any, 
          type: validated.type,
        })
        .returning();

      // 2. Alapértelmezett variáns létrehozása a logisztikai és árazási adatokkal
      await tx.insert(productVariants).values({
        productId: newProduct.id,
        sku: validated.sku || `DIG-${Date.now()}`, // Digitális terméknél fallback generálás
        priceHuf: validated.priceHuf,
        priceEur: validated.priceEur.toString(),
        stock: 0,
        weight: validated.weight ? validated.weight.toString() : null, // Decimal converzió
        width: validated.width ? validated.width.toString() : null,
        height: validated.height ? validated.height.toString() : null,
        depth: validated.depth ? validated.depth.toString() : null,
      });

      // 3. (Opcionális) Média/Kép mentése a Product Media táblába
      if (validated.imageUrl) {
        await tx.insert(productMedia).values({
          productId: newProduct.id,
          url: validated.imageUrl,
          type: "image",
        });
      }

      return newProduct;
    });

    // Sikeres mentés után újra-generáljuk az admin oldalt a friss listához
    revalidatePath("/admin/products");
    return { success: true, product: result };
    
  } catch (error) {
    console.error("Hiba a termék létrehozásakor:", error);
    if (error instanceof z.ZodError) {
       // Kinyerjük a validációs hibaüzenetet
      return { success: false, error: error.issues[0]?.message || "Validációs hiba" };
    }
    return { success: false, error: "Váratlan hiba történt az adatbázisba írás során." };
  }
}
