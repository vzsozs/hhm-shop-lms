"use server";

import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productRecommendations, productAttachments } from "@/db/schema/shop";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProductServerSchema, CreateProductPayload } from "./schemas";
import { eq, sql } from "drizzle-orm";

// SEO-barát slug generáló a termék nevéből
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Ha a slug már létezik, egyedi suffix hozzáadása (-2, -3, stb.)
async function ensureUniqueSlug(baseSlug: string, lang: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    // JSONB keresés Drizzle-ben
    const existing = await db.execute(
      sql`SELECT id FROM products WHERE slug->>${lang} = ${slug} ${excludeId ? sql`AND id != ${excludeId}` : sql``} LIMIT 1`
    );
    
    if (existing.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function createProduct(formData: CreateProductPayload) {
  try {
    const validated = createProductServerSchema.parse(formData);

    // Multilingual Slugs generálása
    const slug = {
      hu: await ensureUniqueSlug(generateSlug(validated.name.hu), "hu"),
      en: validated.name.en ? await ensureUniqueSlug(generateSlug(validated.name.en), "en") : "",
      sk: validated.name.sk ? await ensureUniqueSlug(generateSlug(validated.name.sk), "sk") : "",
    };

    const result = await db.transaction(async (tx) => {
      // 1. Group ID kezelése
      let groupId = null;
      if (validated.familyProductIds && validated.familyProductIds.length > 0) {
        // Megnézzük, van-e már groupId a kiválasztott termékek között
        const familyProducts = await tx.execute(
          sql`SELECT group_id FROM products WHERE id IN (${sql.join(validated.familyProductIds.map(id => sql`${id}`), sql`, `)}) AND group_id IS NOT NULL LIMIT 1`
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        groupId = (familyProducts[0] as any)?.group_id || crypto.randomUUID();
      }

      // 2. Termék létrehozása
      const [newProduct] = await tx
        .insert(products)
        .values({
          slug,
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          specifications: (validated.specifications || []) as any,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
          groupId,
        })
        .returning();

      // 3. Ha van csoport, frissítjük a többi tagot is
      if (groupId && validated.familyProductIds && validated.familyProductIds.length > 0) {
        await tx.execute(
          sql`UPDATE products SET group_id = ${groupId} WHERE id IN (${sql.join(validated.familyProductIds.map(id => sql`${id}`), sql`, `)})`
        );
      }

      // 4. Variáns létrehozása (mostantól csak egy per termék az adminon, de a DB-ben maradhat lista)
      if (validated.variants && validated.variants.length > 0) {
        const v = validated.variants[0]; // Csak az elsőt vesszük (Admin UI korlátozás)
        await tx.insert(productVariants).values({
          productId: newProduct.id,
          name: v.name as Record<string, string>,
          sku: v.sku || `SKU-${Date.now()}`,
          priceHuf: v.priceHuf,
          priceEur: v.priceEur.toString(),
          stock: v.stock || 0,
          weight: v.weight ? v.weight.toString() : null,
          width: v.width ? v.width.toString() : null,
          height: v.height ? v.height.toString() : null,
          depth: v.depth ? v.depth.toString() : null,
        });
      }

      // 5. Média, Kategóriák stb. maradnak hasonlóan...
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

      if (validated.categoryIds && validated.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validated.categoryIds.map((categoryId: string) => ({
            productId: newProduct.id,
            categoryId,
          }))
        );
      }

      if (validated.recommendations && validated.recommendations.length > 0) {
        await tx.insert(productRecommendations).values(
          validated.recommendations.map((recId: string) => ({
            productId: newProduct.id,
            recommendedProductId: recId,
          }))
        );
      }

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

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, product: result };
    
  } catch (error) {
    console.error("Hiba a termék létrehozásakor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validációs hiba" };
    }
    return { success: false, error: "Váratlan hiba történt az adatbázisba írás során." };
  }
}

export async function updateProduct(id: string, formData: CreateProductPayload) {
  try {
    const validated = createProductServerSchema.parse(formData);

    const result = await db.transaction(async (tx) => {
      // 1. Group ID szinkronizálása
      let groupId = null;
      // Meglévő groupId lekérése
      const [currentProduct] = await tx.select({ groupId: products.groupId }).from(products).where(eq(products.id, id));
      groupId = currentProduct?.groupId;

      if (validated.familyProductIds && validated.familyProductIds.length > 0) {
        if (!groupId) {
          // Ha eddig nem volt csoportja, keresünk egyet a tagok között vagy újat generálunk
          const familyWithGroup = await tx.execute(
            sql`SELECT group_id FROM products WHERE id IN (${sql.join(validated.familyProductIds.map(fid => sql`${fid}`), sql`, `)}) AND group_id IS NOT NULL LIMIT 1`
          );
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          groupId = (familyWithGroup[0] as any)?.group_id || crypto.randomUUID();
        }
        
        // Összes tag frissítése (régi tagok is maradhatnak benne, de az admin csak az újakat küldi)
        await tx.execute(
          sql`UPDATE products SET group_id = ${groupId} WHERE id IN (${sql.join([...validated.familyProductIds, id].map(fid => sql`${fid}`), sql`, `)})`
        );
      } else if (groupId) {
         // Ha kiürítették a csoportot, ezt a terméket kivesszük (groupId = null)
         // Kérdés: A többiek maradjanak csoportban? Általában igen.
         groupId = null;
      }

      // 2. Termék frissítése
      const [updatedProduct] = await tx
        .update(products)
        .set({
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          specifications: (validated.specifications || []) as any,
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
          groupId,
        })
        .where(eq(products.id, id))
        .returning();

      // 3. Variáns frissítése (Admin mostantól csak az elsőt kezeli)
      if (validated.variants && validated.variants.length > 0) {
        const v = validated.variants[0];
        const existingVariants = await tx.select().from(productVariants).where(eq(productVariants.productId, id));
        
        if (existingVariants.length > 0) {
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
            .where(eq(productVariants.id, existingVariants[0].id));
            
           // A többi variánst (ha volt régebben) töröljük a konzisztencia miatt
           if (existingVariants.length > 1) {
             for (let i = 1; i < existingVariants.length; i++) {
               await tx.delete(productVariants).where(eq(productVariants.id, existingVariants[i].id));
             }
           }
        } else {
          await tx.insert(productVariants).values({
            productId: id,
            name: v.name as Record<string, string>,
            sku: v.sku || `SKU-${Date.now()}`,
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

      // 4. Média, Kategóriák, Ajánlások, Csatolmányok szinkronizálása
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

      await tx.delete(productCategories).where(eq(productCategories.productId, id));
      if (validated.categoryIds && validated.categoryIds.length > 0) {
        await tx.insert(productCategories).values(
          validated.categoryIds.map((categoryId: string) => ({
            productId: id,
            categoryId,
          }))
        );
      }

      await tx.delete(productRecommendations).where(eq(productRecommendations.productId, id));
      if (validated.recommendations && validated.recommendations.length > 0) {
        await tx.insert(productRecommendations).values(
          validated.recommendations.map((recId: string) => ({
            productId: id,
            recommendedProductId: recId,
          }))
        );
      }

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
    // Multilingual slug revalidation
    if (result.slug && typeof result.slug === 'object') {
      const slugs = result.slug as Record<string, string>;
      Object.values(slugs).forEach(s => {
        if (s) revalidatePath(`/products/${s}`);
      });
    }
    
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
    const newName = { 
      hu: `${(originalProduct.name as any).hu} (Másolat)`,
      en: (originalProduct.name as any).en ? `${(originalProduct.name as any).en} (Copy)` : "",
      sk: (originalProduct.name as any).sk ? `${(originalProduct.name as any).sk} (Kópia)` : "",
    };

    const slug = {
      hu: await ensureUniqueSlug(generateSlug(newName.hu), "hu"),
      en: newName.en ? await ensureUniqueSlug(generateSlug(newName.en), "en") : "",
      sk: newName.sk ? await ensureUniqueSlug(generateSlug(newName.sk), "sk") : "",
    };

    const result = await db.transaction(async (tx) => {
      // 1. Új Termék
      const [newProduct] = await tx.insert(products).values({
        slug,
        name: newName,
        description: originalProduct.description as Record<string, string>,
        shortDescription: originalProduct.shortDescription as Record<string, string>,
        longDescription: originalProduct.longDescription as Record<string, string>,
        specifications: originalProduct.specifications as any,
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

import { generateCategorySlug } from "@/lib/utils";

async function ensureUniqueCategorySlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await db.execute(
      sql`SELECT id FROM categories WHERE slug->>'hu' = ${slug} ${excludeId ? sql`AND id != ${excludeId}` : sql``} LIMIT 1`
    );
    
    if (existing.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

import { categories } from "@/db/schema/shop";
import { CategoryServerPayload, categoryServerSchema } from "./schemas";

export async function upsertCategory(formData: CategoryServerPayload) {
  try {
    const validated = categoryServerSchema.parse(formData);
    const baseSlug = generateCategorySlug(validated.slug.hu || validated.name.hu);
    const slugHu = await ensureUniqueCategorySlug(baseSlug, validated.id);
    const slug = { ...validated.slug, hu: slugHu };

    if (validated.id) {
      // Update
      await db.update(categories)
        .set({
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          slug: slug as Record<string, string>,
          parentId: validated.parentId,
        })
        .where(eq(categories.id, validated.id));
    } else {
      // Create
      await db.insert(categories)
        .values({
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          slug: slug as Record<string, string>,
          parentId: validated.parentId,
        });
    }

    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    console.error("Hiba a kategória mentésekor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validációs hiba" };
    }
    return { success: false, error: "Váratlan hiba történt az adatnyilvántartásban." };
  }
}

export async function deleteCategory(id: string) {
  try {
    // A delete cascade-ok és set null-ok a DB-ben történnek.
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath("/admin/categories");
    return { success: true };
  } catch(error) {
    console.error("Hiba a kategória törlésekor:", error);
    return { success: false, error: "Nem sikerült törölni a kategóriát." };
  }
}
