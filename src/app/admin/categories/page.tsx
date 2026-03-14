import { db } from "@/db";
import { categories } from "@/db/schema/shop";
import { asc } from "drizzle-orm";
import { CategoryClient } from "./category-client";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  // 1. Lekérünk minden kategóriát
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.name)); // Ideiglenes rendezés, memória szinten építjük a fát


  // 3. Rekurzív függvény a hierarchikus lista építéséhez
  const hierarchicalList: (typeof allCategories[0] & { 
    depth: number; 
    parentNameHu?: string;
    name: Record<string, string>;
    description: Record<string, string> | null;
    slug: Record<string, string>;
  })[] = [];

  function buildHierarchy(parentId: string | null, depth: number, parentName?: string) {
    const children = allCategories.filter(c => c.parentId === parentId);
    
    // Rendezés ABC szerint
    children.sort((a, b) => {
      const nameA = (a.name as Record<string, string>)?.hu || "";
      const nameB = (b.name as Record<string, string>)?.hu || "";
      return nameA.localeCompare(nameB, "hu");
    });

    for (const child of children) {
      const nameObj = child.name as Record<string, string>;
      hierarchicalList.push({
        ...child,
        depth,
        parentNameHu: parentName,
        name: nameObj,
        description: child.description as Record<string, string> | null,
        slug: child.slug as Record<string, string>,
      });
      // Rekurzió a gyerekekre
      buildHierarchy(child.id, depth + 1, nameObj.hu || "Névtelen");
    }
  }

  // Start building from root
  buildHierarchy(null, 0);

  // Csatlakoztatjuk azokat az "árva" kategóriákat, amiknek a szülője nem létezik vagy nem szerepel a hierarchiában
  const allListedIds = new Set(hierarchicalList.map(c => c.id));
  const orphans = allCategories.filter(c => !allListedIds.has(c.id));
  for (const orphan of orphans) {
    hierarchicalList.push({ 
      ...orphan, 
      depth: 0,
      name: orphan.name as Record<string, string>,
      description: orphan.description as Record<string, string> | null,
      slug: orphan.slug as Record<string, string>,
    });
  }

  const typedHierarchicalList = hierarchicalList;

  // 4. Szülő-választóhoz hierarchikus lista (prefixekkel)
  const flatCategoriesForSelect = hierarchicalList.map(c => ({
    id: c.id,
    name: `${"  ".repeat(c.depth)}${c.depth > 0 ? "└── " : ""}${c.name.hu || "Névtelen"}`,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <CategoryClient 
        categories={typedHierarchicalList} 
        flatCategories={flatCategoriesForSelect} 
      />
    </div>
  );
}
