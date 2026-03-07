"use server";

import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productRecommendations, productAttachments } from "@/db/schema/shop";
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          specifications: (validated.specifications || []) as any,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
        })
        .returning();

      // 2. Variánsok létrehozása
      if (validated.variants && validated.variants.length > 0) {
        await tx.insert(productVariants).values(
          validated.variants.map((v) => ({
            productId: newProduct.id,
            name: v.name as Record<string, string>,
            sku: v.sku || `DIG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            priceHuf: v.priceHuf,
            priceEur: v.priceEur.toString(),
            stock: v.stock || 0,
            weight: v.weight ? v.weight.toString() : null,
            width: v.width ? v.width.toString() : null,
            height: v.height ? v.height.toString() : null,
            depth: v.depth ? v.depth.toString() : null,
          }))
        );
      }

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

      // 5. Ajánlások mentése
      if (validated.recommendations && validated.recommendations.length > 0) {
        await tx.insert(productRecommendations).values(
          validated.recommendations.map((recId: string) => ({
            productId: newProduct.id,
            recommendedProductId: recId,
          }))
        );
      }

      // 6. Csatolmányok mentése
      if (validated.attachments && validated.attachments.length > 0) {
        await tx.insert(productAttachments).values(
          validated.attachments.map((att) => ({
            productId: newProduct.id,
            url: att.url,
            name: att.name,
          }))
        );
      }

      return newProduct;
    });

    // Sikeres mentés után újra-generáljuk az admin és a publikus termékoldalt
    revalidatePath("/admin");
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          specifications: (validated.specifications || []) as any,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
        })
        .where(eq(products.id, id))
        .returning();

      // 2. Variánsok szinkronizálása (upsert / delete logika)
      const existingVariants = await tx.select().from(productVariants).where(eq(productVariants.productId, id));
      
      const payloadVarIds = validated.variants?.map((v) => v.id).filter(Boolean) || [];
      
      // Amik nincsenek a listában, azokat beszéljük / töröljük
      const variantsToDelete = existingVariants.filter(ev => !payloadVarIds.includes(ev.id));
      if (variantsToDelete.length > 0) {
         for (const vdel of variantsToDelete) {
           await tx.delete(productVariants).where(eq(productVariants.id, vdel.id));
         }
      }

      // Upsert
      if (validated.variants) {
        for (const v of validated.variants) {
          if (v.id) {
            await tx.update(productVariants)
              .set({
                name: v.name as Record<string, string>,
                sku: v.sku,
                priceHuf: v.priceHuf,
                priceEur: v.priceEur.toString(),
                stock: v.stock,
                weight: v.weight ? v.weight.toString() : null,
                width: v.width ? v.width.toString() : null,
                height: v.height ? v.height.toString() : null,
                depth: v.depth ? v.depth.toString() : null,
              })
              .where(eq(productVariants.id, v.id));
          } else {
            await tx.insert(productVariants).values({
              productId: id,
              name: v.name as Record<string, string>,
              sku: v.sku || `DIG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              priceHuf: v.priceHuf,
              priceEur: v.priceEur.toString(),
              stock: v.stock || 0,
              weight: v.weight ? v.weight.toString() : null,
              width: v.width ? v.width.toString() : null,
              height: v.height ? v.height.toString() : null,
              depth: v.depth ? v.depth.toString() : null,
            });
          }
        }
      }

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

      // 5. Ajánlások szinkronizálása
      await tx.delete(productRecommendations).where(eq(productRecommendations.productId, id));
      if (validated.recommendations && validated.recommendations.length > 0) {
        await tx.insert(productRecommendations).values(
          validated.recommendations.map((recId: string) => ({
            productId: id,
            recommendedProductId: recId,
          }))
        );
      }

      // 6. Csatolmányok szinkronizálása
      await tx.delete(productAttachments).where(eq(productAttachments.productId, id));
      if (validated.attachments && validated.attachments.length > 0) {
        await tx.insert(productAttachments).values(
          validated.attachments.map((att) => ({
            productId: id,
            url: att.url,
            name: att.name,
          }))
        );
      }

      return updatedProduct;
    });

    revalidatePath("/admin");
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

export async function deleteProduct(id: string) {
  try {
    // A related adatok a legtöbb helyen CASCADE-del vannak megadva, kivéve ha manuálisan kell törölni
    // A db schema alapján a legtöbb references tartalmazza az { onDelete: 'cascade' } opciót.
    // Biztos ami biztos, töröljük a productMedia-t, bár az is kaszkádolva törlődne.
    await db.delete(products).where(eq(products.id, id));
    
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    
    return { success: true };
  } catch(error) {
    console.error("Hiba a termék törlésekor:", error);
    return { success: false, error: "Nem sikerült törölni a terméket." };
  }
}

export async function duplicateProduct(id: string) {
  try {
    const [originalProduct] = await db.select().from(products).where(eq(products.id, id));
    if (!originalProduct) return { success: false, error: "A másolandó termék nem található." };

    // Kikeressük az eredeti adatokat amiket szintén másolni kell
    const variants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
    const media = await db.select().from(productMedia).where(eq(productMedia.productId, id));
    const categories = await db.select().from(productCategories).where(eq(productCategories.productId, id));
    const attachments = await db.select().from(productAttachments).where(eq(productAttachments.productId, id));

    // Új alap adatok és módosított slug
    const newName = { ...originalProduct.name as object, hu: `${(originalProduct.name as Record<string,string>).hu} (Másolat)` };
    const baseSlug = generateSlug(newName as Record<string, string>);
    const slug = await ensureUniqueSlug(baseSlug);

    const result = await db.transaction(async (tx) => {
      // 1. Új Termék
      const [newProduct] = await tx.insert(products).values({
        slug,
        name: newName,
        description: originalProduct.description,
        shortDescription: originalProduct.shortDescription,
        longDescription: originalProduct.longDescription,
        specifications: originalProduct.specifications,
        type: originalProduct.type,
        status: "INACTIVE", // Másolatok mindig piszkozatként jöjjenek létre
        priority: originalProduct.priority,
        layoutTemplate: originalProduct.layoutTemplate,
      }).returning();

      // 2. Variációk másolása
      if (variants.length > 0) {
        await tx.insert(productVariants).values(
          variants.map(v => ({
            productId: newProduct.id,
            name: v.name,
            sku: `${v.sku}-COPY-${Math.floor(Math.random() * 1000)}`, // Új egyedi SKU generálása
            priceHuf: v.priceHuf,
            priceEur: v.priceEur,
            stock: 0, // Készletet nullázzuk teszt / másolás miatt
            weight: v.weight,
            width: v.width,
            height: v.height,
            depth: v.depth,
          }))
        );
      }

      // 3. Média másolása
      if (media.length > 0) {
        await tx.insert(productMedia).values(
          media.map(m => ({
            productId: newProduct.id,
            url: m.url,
            type: m.type,
            order: m.order,
          }))
        );
      }

      // 4. Kategóriák
      if (categories.length > 0) {
        await tx.insert(productCategories).values(
          categories.map(c => ({
            productId: newProduct.id,
            categoryId: c.categoryId,
          }))
        );
      }

      // 5. Csatolmányok
      if (attachments.length > 0) {
        await tx.insert(productAttachments).values(
          attachments.map(a => ({
            productId: newProduct.id,
            url: a.url,
            name: a.name,
          }))
        );
      }

      return newProduct;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    
    return { success: true, product: result };

  } catch (error) {
    console.error("Hiba a termék másolásakor:", error);
    return { success: false, error: "Váratlan hiba történt a másolat készítése során." };
  }
}


