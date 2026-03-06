"use server";

import { db } from "@/db";
import { products, productVariants, productMedia, productCategories } from "@/db/schema/shop";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProductServerSchema, CreateProductPayload } from "./schemas";
import { eq } from "drizzle-orm";

// SEO-barát slug generáló a termék nevéből (hu alapján, vagy bármely elérhető nyelvből)
function generateSlug(name: Record<string, string>): string {
  const base = name.hu || name.en || name.sk || "termek";
  return base
    .toLowerCase()
    .normalize("NFD") // Ékezetek lebontása (á → a, é → e, stb.)
    .replace(/[\u0300-\u036f]/g, "") // Ékezetjelek eltávolítása
    .replace(/[^a-z0-9\s-]/g, "") // Csak betű, szám, szóköz, kötőjel marad
    .trim()
    .replace(/\s+/g, "-") // Szóközök → kötőjel
    .replace(/-+/g, "-"); // Dupla kötőjel összevonása
}

// Ha a slug már létezik, egyedi suffix hozzáadása (-2, -3, stb.)
async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function createProduct(formData: CreateProductPayload) {
  try {
    // Szigorú szerveroldali validálás a központosított sémával
    const validated = createProductServerSchema.parse(formData);

    // Slug generálás a termék nevéből
    const baseSlug = generateSlug(validated.name as Record<string, string>);
    const slug = await ensureUniqueSlug(baseSlug);

    // Tranzakció indítása az inkonzisztenciák elkerülésére
    const result = await db.transaction(async (tx) => {
      // 1. Termék létrehozása a Products táblában (JSONB nevekkel és leírásokkal)
      const [newProduct] = await tx
        .insert(products)
        .values({
          slug, // Automatikusan generált SEO slug
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
        })
        .returning();

      // 2. Alapértelmezett variáns létrehozása a logisztikai és árazási adatokkal
      await tx.insert(productVariants).values({
        productId: newProduct.id,
        sku: validated.sku || `DIG-${Date.now()}`, // Digitális terméknél fallback generálás
        priceHuf: validated.priceHuf,
        priceEur: validated.priceEur.toString(),
        stock: 0,
        weight: validated.weight ? validated.weight.toString() : null, // Decimal konverzió
        width: validated.width ? validated.width.toString() : null,
        height: validated.height ? validated.height.toString() : null,
        depth: validated.depth ? validated.depth.toString() : null,
      });

      // 3. Média mentése a Product Media táblába
      if (validated.media && validated.media.length > 0) {
        await tx.insert(productMedia).values(
          validated.media.map((m, index) => ({
            productId: newProduct.id,
            url: m.url,
            type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
            order: index,
          }))
        );
      }

      // 4. Kategória hozzárendelések mentése
      if (validated.categoryIds && validated.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validated.categoryIds.map((categoryId: string) => ({
            productId: newProduct.id,
            categoryId,
          }))
        );
      }

      return newProduct;
    });

    // Sikeres mentés után újra-generáljuk az admin és a publikus termékoldalt
    revalidatePath("/admin/products");
    revalidatePath("/products");
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

export async function updateProduct(id: string, formData: CreateProductPayload) {
  try {
    const validated = createProductServerSchema.parse(formData);

    const result = await db.transaction(async (tx) => {
      // 1. Termék frissítése
      const [updatedProduct] = await tx
        .update(products)
        .set({
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
        })
        .where(eq(products.id, id))
        .returning();

      // 2. Variáns frissítése
      await tx
        .update(productVariants)
        .set({
          sku: validated.sku || `DIG-${Date.now()}`,
          priceHuf: validated.priceHuf,
          priceEur: validated.priceEur.toString(),
          weight: validated.weight ? validated.weight.toString() : null,
          width: validated.width ? validated.width.toString() : null,
          height: validated.height ? validated.height.toString() : null,
          depth: validated.depth ? validated.depth.toString() : null,
        })
        .where(eq(productVariants.productId, id));

      // 3. Média szinkronizálása (Törlünk mindent és újra felvisszük az új sorrenddel)
      await tx.delete(productMedia).where(eq(productMedia.productId, id));

      if (validated.media && validated.media.length > 0) {
        await tx.insert(productMedia).values(
          validated.media.map((m, index) => ({
            productId: id,
            url: m.url,
            type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO",
            order: index,
          }))
        );
      }

      // 4. Kategória szinkronizálása
      await tx.delete(productCategories).where(eq(productCategories.productId, id));
      if (validated.categoryIds && validated.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validated.categoryIds.map((categoryId: string) => ({
            productId: id,
            categoryId,
          }))
        );
      }

      return updatedProduct;
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${result.slug}`);
    
    return { success: true, product: result };

  } catch (error) {
    console.error("Hiba a termék frissítésekor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validációs hiba" };
    }
    return { success: false, error: "Váratlan hiba történt a módosítás során." };
  }
}

