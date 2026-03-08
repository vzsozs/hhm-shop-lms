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

  // 2. Memóriában felépítjük a hierarchiát (Fa struktúra)
  // Csak kétszintű hierarchia (szülő-gyerek) van általános esetben.
  
  // Főkategóriák kiválasztása
  const rootCategories = allCategories.filter((c) => !c.parentId);
  
  // Gyerek kategóriák szétválogatása szülők alá
  const childrenMap = new Map<string, typeof allCategories>();
  for (const cat of allCategories) {
    if (cat.parentId) {
      if (!childrenMap.has(cat.parentId)) {
        childrenMap.set(cat.parentId, []);
      }
      childrenMap.get(cat.parentId)!.push(cat);
    }
  }

  // 3. Laposított, de hierarchikus sorrendben lévő lista generálása
  const hierarchicalList: (typeof allCategories[0] & { depth: number; parentNameHu?: string })[] = [];

  for (const root of rootCategories) {
    // Főkategória hozzáadása (depth 0)
    hierarchicalList.push({ ...root, depth: 0 });
    
    // Hozzá tartozó gyerekek hozzáadása (depth 1)
    const children = childrenMap.get(root.id) || [];
    // Opcionálisan rendezhetjük a gyerekeket ABC szerint
    children.sort((a, b) => {
      const nameA = (a.name as Record<string, string>)?.hu || "";
      const nameB = (b.name as Record<string, string>)?.hu || "";
      return nameA.localeCompare(nameB, "hu");
    });

    for (const child of children) {
      hierarchicalList.push({ 
        ...child, 
        depth: 1, 
        parentNameHu: (root.name as Record<string, string>)?.hu || "Ismeretlen" 
      });
    }
  }

  // Csatlakoztatjuk azokat az "árva" kategóriákat, amiknek a szülője nem létezik valami hiba miatt (ritka, de hasznos)
  const allListedIds = new Set(hierarchicalList.map(c => c.id));
  const orphans = allCategories.filter(c => !allListedIds.has(c.id));
  for (const orphan of orphans) {
    hierarchicalList.push({ ...orphan, depth: 0 });
  }

  // Csak az egyszerű listát adjuk át a formnak a selecthoz (szülő választó)
  const flatCategoriesForSelect = allCategories.map(c => ({
    id: c.id,
    name: (c.name as Record<string, string>)?.hu || c.slug,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <CategoryClient 
        categories={hierarchicalList} 
        flatCategories={flatCategoriesForSelect} 
      />
    </div>
  );
}
