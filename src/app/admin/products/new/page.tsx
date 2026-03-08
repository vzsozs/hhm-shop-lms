import { ProductForm } from "@/modules/shop/components/product-form";
import { db } from "@/db";
import { categories } from "@/db/schema/shop";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const allCategories = await db.select().from(categories);

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      <ProductForm categories={allCategories as unknown as { id: string, name: Record<string, string> }[]} />
    </div>
  );
}
