"use server";

import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productRecommendations, productAttachments, productGroups, badgeSettings } from "@/db/schema/shop";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { badgeSettingsSchema, BadgeSettingsPayload, createProductServerSchema, CreateProductPayload, ProductGroupServerPayload, productGroupServerSchema } from "./schemas";
import { eq, sql } from "drizzle-orm";
import { ensureUniqueSlug, generateSlug } from "@/lib/utils/slug";

// Named Group létrehozása a product_groups táblában (tranzakción belül)
async function createProductGroupHelper(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  name: Record<string, string>
): Promise<string> {
  const slug = {
    hu: await ensureUniqueSlug(generateSlug(name.hu || ""), "hu", "product_groups", tx),
    en: name.en ? await ensureUniqueSlug(generateSlug(name.en), "en", "product_groups", tx) : "",
    sk: name.sk ? await ensureUniqueSlug(generateSlug(name.sk), "sk", "product_groups", tx) : "",
  };
  const [group] = await tx
    .insert(productGroups)
    .values({ name, slug })
    .returning({ id: productGroups.id });
  return group.id;
}

// Árva csoport törlése: ha nincs már tagja, töröljük a product_groups sort
async function cleanupOrphanGroup(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  groupId: string,
  excludeProductId?: string
): Promise<void> {
  const whereClause = excludeProductId
    ? sql`group_id = ${groupId} AND id != ${excludeProductId}`
    : sql`group_id = ${groupId}`;

  const [{ value: remaining }] = await tx.execute(
    sql`SELECT COUNT(*)::int as value FROM products WHERE ${whereClause}`
  );
  if ((remaining as number) === 0) {
    await tx.delete(productGroups).where(eq(productGroups.id, groupId));
  }
}

export async function createProduct(formData: CreateProductPayload) {
  try {
    const validated = createProductServerSchema.parse(formData);

    const result = await db.transaction(async (tx) => {
      // Multilingual Slugs generálása
      const slug = {
        hu: await ensureUniqueSlug(generateSlug(validated.name.hu), "hu", "products", tx),
        en: validated.name.en ? await ensureUniqueSlug(generateSlug(validated.name.en), "en", "products", tx) : "",
        sk: validated.name.sk ? await ensureUniqueSlug(generateSlug(validated.name.sk), "sk", "products", tx) : "",
      };

      // 1. Named Group ID kezelése
      let groupId: string | null = null;

      if (validated.newGroupName?.hu) {
        // Mód: "Új named group" – létrehozzuk a product_groups sort
        groupId = await createProductGroupHelper(tx, {
          hu: validated.newGroupName.hu,
          en: validated.newGroupName.en || "",
          sk: validated.newGroupName.sk || "",
        });
      } else if (validated.selectedGroupId) {
        // Mód: "Csatlakozás meglévő családhoz" – a kiválasztott csoport ID-ját használjuk
        groupId = validated.selectedGroupId;
      }
      // Mód: "Önálló" – groupId = null

      // 2. Termék létrehozása
      const [newProduct] = await tx
        .insert(products)
        .values({
          slug,
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          specifications: (validated.specifications || []) as Record<string, string>[],
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
          badges: validated.badges,
          groupId,
        })
        .returning();

      // 2. Termék létrehozása
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
      // 1. Named Group kezelése (3 mód)
      const [currentProduct] = await tx.select({ groupId: products.groupId }).from(products).where(eq(products.id, id));
      const previousGroupId = currentProduct?.groupId ?? null;
      let groupId: string | null = null;

      if (validated.newGroupName?.hu) {
        // Mód: "Új named group" - létrehozzuk a product_groups sort
        groupId = await createProductGroupHelper(tx, {
          hu: validated.newGroupName.hu,
          en: validated.newGroupName.en || "",
          sk: validated.newGroupName.sk || "",
        });
      } else if (validated.selectedGroupId) {
        // Mód: "Csatlakozás meglévő családhoz"
        groupId = validated.selectedGroupId;
      }
      // Mód: "Önálló" - groupId = null

      // Ha a termék kilépett egy családból (previousGroupId volt, de úsj nincs): árva-ellenőrzés
      if (previousGroupId && previousGroupId !== groupId) {
        await cleanupOrphanGroup(tx, previousGroupId, id);
      }

      // 2. Termék frissítése
      const [updatedProduct] = await tx
        .update(products)
        .set({
          name: validated.name as Record<string, string>,
          description: validated.description as Record<string, string>,
          shortDescription: validated.shortDescription as Record<string, string>,
          longDescription: validated.longDescription as Record<string, string>,
          specifications: (validated.specifications || []) as Record<string, string>[],
          type: validated.type,
          status: validated.status,
          priority: validated.priority,
          layoutTemplate: validated.layoutTemplate,
          badges: validated.badges,
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
    // A projects schema alapján a legtöbb references tartalmazza az { onDelete: 'cascade' } opciót.
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

export async function deleteProducts(ids: string[]) {
  try {
    await db.delete(products).where(sql`${products.id} IN ${ids}`);
    
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    
    return { success: true };
  } catch(error) {
    console.error("Hiba a termékek csoportos törlésekor:", error);
    return { success: false, error: "Nem sikerült törölni a kijelölt termékeket." };
  }
}

export async function updateProductsStatus(ids: string[], status: "ACTIVE" | "INACTIVE") {
  try {
    await db.update(products)
      .set({ status })
      .where(sql`${products.id} IN ${ids}`);
    
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    
    return { success: true };
  } catch(error) {
    console.error("Hiba a termékek csoportos frissítésekor:", error);
    return { success: false, error: "Nem sikerült frissíteni a kijelölt termékeket." };
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
    const originalName = originalProduct.name as Record<string, string>;
    const newName = { 
      hu: `${originalName.hu} (Másolat)`,
      en: originalName.en ? `${originalName.en} (Copy)` : "",
      sk: originalName.sk ? `${originalName.sk} (Kópia)` : "",
    };

    const result = await db.transaction(async (tx) => {
      // Új alap adatok és módosított slug
      const slug = {
        hu: await ensureUniqueSlug(generateSlug(newName.hu), "hu", "products", tx),
        en: newName.en ? await ensureUniqueSlug(generateSlug(newName.en), "en", "products", tx) : "",
        sk: newName.sk ? await ensureUniqueSlug(generateSlug(newName.sk), "sk", "products", tx) : "",
      };

      // 1. Új Termék
      const [newProduct] = await tx.insert(products).values({
        slug,
        name: newName,
        description: originalProduct.description as Record<string, string>,
        shortDescription: originalProduct.shortDescription as Record<string, string>,
        longDescription: originalProduct.longDescription as Record<string, string>,
        specifications: originalProduct.specifications as Record<string, string>[] | null,
        type: originalProduct.type,
        status: "INACTIVE", // Másolatok mindig piszkozatként jöjjenek létre
        priority: originalProduct.priority,
        layoutTemplate: originalProduct.layoutTemplate,
        badges: originalProduct.badges as { icon: string }[],
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


import { categories } from "@/db/schema/shop";
import { CategoryServerPayload, categoryServerSchema } from "./schemas";

export async function upsertCategory(formData: CategoryServerPayload) {
  try {
    const validated = categoryServerSchema.parse(formData);
    const result = await db.transaction(async (tx) => {
      const baseSlug = generateSlug(validated.slug.hu || validated.name.hu);
      const slugHu = await ensureUniqueSlug(baseSlug, "hu", "categories", tx, validated.id);
      const slug = { ...validated.slug, hu: slugHu };
      if (validated.id) {
        // Update
        await tx.update(categories)
          .set({
            name: validated.name as Record<string, string>,
            description: validated.description as Record<string, string>,
            slug: slug as Record<string, string>,
            parentId: validated.parentId,
          })
          .where(eq(categories.id, validated.id));
      } else {
        // Create
        await tx.insert(categories)
          .values({
            name: validated.name as Record<string, string>,
            description: validated.description as Record<string, string>,
            slug: slug as Record<string, string>,
            parentId: validated.parentId,
          });
      }
      return { success: true };
    });

    revalidatePath("/admin/categories");
    return result;
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

export async function getBadgeIcons() {
  try {
    const badgesDir = path.join(process.cwd(), "public", "assets", "badges");
    
    if (!fs.existsSync(badgesDir)) {
      return [];
    }

    const files = fs.readdirSync(badgesDir);
    return files.filter(file => 
      file.endsWith(".svg") || 
      file.endsWith(".png") || 
      file.endsWith(".jpg") || 
      file.endsWith(".webp")
    );
  } catch (error) {
    console.error("Hiba a badge ikonok beolvasásakor:", error);
    return [];
  }
}

export async function getAllBadgeSettings() {
  try {
    const settings = await db.select().from(badgeSettings);
    return settings;
  } catch (error) {
    console.error("Hiba a badge beállítások lekérdezésekor:", error);
    return [];
  }
}

export async function upsertBadgeSettings(data: BadgeSettingsPayload) {
  try {
    const validated = badgeSettingsSchema.parse(data);
    
    const existing = await db
      .select()
      .from(badgeSettings)
      .where(eq(badgeSettings.iconName, validated.iconName))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(badgeSettings)
        .set({
          tooltips: validated.tooltips,
          updatedAt: new Date(),
        })
        .where(eq(badgeSettings.iconName, validated.iconName));
    } else {
      await db
        .insert(badgeSettings)
        .values({
          iconName: validated.iconName,
          tooltips: validated.tooltips,
        });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Hiba a badge beállítás mentésekor:", error);
    return { success: false, error: "Nem sikerült menteni a beállítást." };
  }
}

export async function updateProductGroup(data: ProductGroupServerPayload) {
  try {
    const validated = productGroupServerSchema.parse(data);
    
    await db.update(productGroups)
      .set({
        name: validated.name as Record<string, string>,
        slug: validated.slug as Record<string, string>,
        updatedAt: new Date(),
      })
      .where(eq(productGroups.id, validated.id));

    revalidatePath("/admin/product-groups");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Hiba a termékcsalád frissítésekor:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validációs hiba" };
    }
    return { success: false, error: "Váratlan hiba történt a módosítás során." };
  }
}

export async function deleteProductGroup(id: string) {
  try {
    // A termékeknél a groupId SET NULL lesz a DB szinten
    await db.delete(productGroups).where(eq(productGroups.id, id));
    
    revalidatePath("/admin/product-groups");
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Hiba a termékcsalád törlésekor:", error);
    return { success: false, error: "Nem sikerült törölni a termékcsaládot." };
  }
}
