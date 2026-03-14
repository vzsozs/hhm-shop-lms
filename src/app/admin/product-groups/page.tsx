import { db } from "@/db";
import { productGroups, products } from "@/db/schema/shop";
import { eq, desc } from "drizzle-orm";
import { ProductGroupsClient } from "./product-groups-client";
import { Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminProductGroupsPage() {
  const groups = await db
    .select()
    .from(productGroups)
    .orderBy(desc(productGroups.createdAt));

  // Fetch all products that belong to any group to show as members
  const allGroupProducts = await db
    .select({
      id: products.id,
      name: products.name,
      groupId: products.groupId,
    })
    .from(products)
    .where(eq(products.status, "ACTIVE"));

  // Map products to their groups
  const groupsWithProducts = groups.map((group) => ({
    ...group,
    name: group.name as Record<string, string>,
    slug: group.slug as Record<string, string>,
    products: allGroupProducts
      .filter((p) => p.groupId === group.id)
      .map((p) => ({
        id: p.id,
        name: p.name as Record<string, string>,
      })),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Award className="text-brand-orange" size={28} />
            Termékcsaládok
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Termékcsaládok (Product Groups) kezelése és tagjaik áttekintése
          </p>
        </div>
      </div>

      <ProductGroupsClient groups={groupsWithProducts} />
    </div>
  );
}
