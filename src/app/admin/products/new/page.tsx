import { ProductForm } from "@/modules/shop/components/product-form";
import { db } from "@/db";
import { categories, products } from "@/db/schema/shop";
import { getAllProductGroups } from "@/modules/shop/queries";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [allCategories, allProducts, allProductGroups] = await Promise.all([
    db.select().from(categories),
    db.select({ id: products.id, name: products.name }).from(products).where(eq(products.status, "ACTIVE")),
    getAllProductGroups(),
  ]);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <ProductForm
        categories={allCategories as unknown as { id: string; name: Record<string, string> }[]}
        products={allProducts as unknown as { id: string; name: Record<string, string> }[]}
        productGroups={allProductGroups}
      />
    </div>
  );
}
