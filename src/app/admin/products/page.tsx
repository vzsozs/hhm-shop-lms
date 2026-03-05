import { ProductForm } from "@/modules/shop/components/product-form";
import { getTranslation } from "@/modules/shared/lib/i18n";

export default async function AdminProductsPage() {
  // Példa i18n használatára a szerver oldalon
  const title = await getTranslation("admin.products.title", "hu");

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">{title === "admin.products.title" ? "Termékek kezelése" : title}</h1>
      </div>
      
      <div className="grid gap-10">
        <section>
          <ProductForm />
        </section>
        
        {/* Ide jön majd később a termék lista */}
      </div>
    </div>
  );
}
