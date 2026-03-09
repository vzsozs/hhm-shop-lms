import { ProductForm } from "@/modules/shop/components/product-form";
import type { ProductFormValues } from "@/modules/shop/hooks/use-product-form";
import { db } from "@/db";
import { products, productVariants, productMedia, productCategories, productAttachments } from "@/db/schema/shop";
import { categories } from "@/db/schema/shop";
import { getAllProductGroups } from "@/modules/shop/queries";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Termék adatainak lekérdezése az adatbázisból
  const [productData] = await db.select().from(products).where(eq(products.id, id));

  if (!productData) {
    notFound();
  }

  // 2. Kapcsolódó táblák lekérdezése
  const variantData = await db.select().from(productVariants).where(eq(productVariants.productId, id));
  const mediaData = await db.select().from(productMedia).where(eq(productMedia.productId, id)).orderBy(productMedia.order);
  const categoryData = await db.select({ id: productCategories.categoryId }).from(productCategories).where(eq(productCategories.productId, id));
  const attachmentData = await db.select().from(productAttachments).where(eq(productAttachments.productId, id));
  
  // Összes elérhető kategória, termék és termékcsalád
  const [allCategories, allProducts, allProductGroups] = await Promise.all([
    db.select().from(categories),
    db.select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.status, "ACTIVE")),
    getAllProductGroups(),
  ]);

  // A csoport-mód meghatározása a meglévő groupId alapján
  const groupMode = productData.groupId ? "join_group" : "standalone";
  const selectedGroupId = productData.groupId || undefined;

  // 3. Adatok átalakítása a ProductForm számara elvárt formátumra (ProductFormValues)
  const initialData: Partial<ProductFormValues> = {
    type: productData.type,
    name_hu: (productData.name as Record<string, string>)?.hu || "",
    name_en: (productData.name as Record<string, string>)?.en || "",
    name_sk: (productData.name as Record<string, string>)?.sk || "",
    description_hu: (productData.description as Record<string, string>)?.hu || "",
    description_en: (productData.description as Record<string, string>)?.en || "",
    description_sk: (productData.description as Record<string, string>)?.sk || "",
    shortDescription_hu: (productData.shortDescription as Record<string, string>)?.hu || "",
    shortDescription_en: (productData.shortDescription as Record<string, string>)?.en || "",
    shortDescription_sk: (productData.shortDescription as Record<string, string>)?.sk || "",
    longDescription_hu: (productData.longDescription as Record<string, string>)?.hu || "",
    longDescription_en: (productData.longDescription as Record<string, string>)?.en || "",
    longDescription_sk: (productData.longDescription as Record<string, string>)?.sk || "",
    status: productData.status,
    priority: productData.priority,
    layoutTemplate: productData.layoutTemplate as "STANDARD" | "VIDEO_CENTERED" | "DOCUMENTARY",
    // @ts-expect-error Drizzle spec type fallback
    specifications: productData.specifications || [],
    categoryIds: categoryData.map(c => c.id),
    groupMode: groupMode as "standalone" | "new_group" | "join_group",
    selectedGroupId,
    variants: variantData.map(v => ({
      id: v.id,
      name_hu: (v.name as Record<string, string>)?.hu || "",
      name_en: (v.name as Record<string, string>)?.en || "",
      name_sk: (v.name as Record<string, string>)?.sk || "",
      sku: v.sku,
      priceHuf: v.priceHuf,
      priceEur: Number(v.priceEur),
      stock: v.stock,
      weight: Number(v.weight),
      width: Number(v.width),
      height: Number(v.height),
      depth: Number(v.depth),
    })),
    media: mediaData.map(m => ({
      url: m.url,
      type: m.type as "IMAGE" | "YOUTUBE" | "AUDIO"
    })),
    attachments: attachmentData.map(a => ({
      url: a.url,
      name: a.name
    }))
  };

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <ProductForm
        initialData={initialData}
        categories={allCategories as unknown as { id: string; name: Record<string, string> }[]}
        products={allProducts as unknown as { id: string; name: Record<string, string> }[]}
        productGroups={allProductGroups}
        productId={id}
      />
    </div>
  );
}
