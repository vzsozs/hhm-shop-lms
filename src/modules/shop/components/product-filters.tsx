"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "use-debounce"; // Gyors keresés várakozás 

type CategoryItem = { id: string; name: Record<string, string>; slug: Record<string, string> };

interface ProductFiltersProps {
  initialSearch?: string;
  initialType?: "physical" | "digital";
  initialCategoryId?: string;
  initialSort?: string;
  categories: CategoryItem[];
  lang: string;
}

export function ProductFilters({ 
  initialSearch = "", 
  initialType, 
  initialCategoryId = "all",
  initialSort = "newest",
  categories,
  lang
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Lokális állapotok a gyors visszajelzéshez (debouncing miatt elválik az URL-től picit)
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // 500ms várakozás

  const [type, setType] = useState(initialType || "all");
  const [categoryId, setCategoryId] = useState(initialCategoryId || "all");
  const [sort, setSort] = useState(initialSort || "newest");

  // Kiszűrjük a végtelen ciklust: az URL-t csak akkor frissítjük, ha az értékek TÉNYLEG eltérnek a jelenlegi URL params-től
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    // Search
    const currentSearch = params.get("search") || "";
    if (debouncedSearchTerm && debouncedSearchTerm !== currentSearch) {
      params.set("search", debouncedSearchTerm);
      hasChanges = true;
    } else if (!debouncedSearchTerm && params.has("search")) {
      params.delete("search");
      hasChanges = true;
    }

    // Type
    const currentType = params.get("type") || "all";
    if (type !== "all" && type !== currentType) {
      params.set("type", type);
      hasChanges = true;
    } else if (type === "all" && params.has("type")) {
      params.delete("type");
      hasChanges = true;
    }

    // Category
    const currentCat = params.get("categoryId") || "all";
    if (categoryId !== "all" && categoryId !== currentCat) {
      params.set("categoryId", categoryId);
      hasChanges = true;
    } else if (categoryId === "all" && params.has("categoryId")) {
      params.delete("categoryId");
      hasChanges = true;
    }

    // Sort
    const currentSort = params.get("sort") || "newest";
    if (sort !== "newest" && sort !== currentSort) {
      params.set("sort", sort);
      hasChanges = true;
    } else if (sort === "newest" && params.has("sort")) {
      params.delete("sort");
      hasChanges = true;
    }

    if (hasChanges) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, type, categoryId, sort, pathname, router, searchParams]);

  const dict: Record<string, Record<string, string>> = {
    hu: {
      searchPlaceholder: "Keresés a termékek között...",
      typeAll: "Minden Típus",
      typePhysical: "Termékek",
      typeDigital: "Tanfolyamok",
      categoryAll: "Összes Kategória",
      sortLabel: "Rendezés",
      sortNewest: "Legújabb elöl",
      sortPriceAsc: "Ár: Olcsótól drágábbra",
      sortPriceDesc: "Ár: Drágától olcsóbbra",
      sortNameAsc: "Név: A-Z",
      sortNameDesc: "Név: Z-A",
    },
    en: {
      searchPlaceholder: "Search products...",
      typeAll: "All Types",
      typePhysical: "Products",
      typeDigital: "Courses",
      categoryAll: "All Categories",
      sortLabel: "Sort",
      sortNewest: "Newest first",
      sortPriceAsc: "Price: Low to high",
      sortPriceDesc: "Price: High to low",
      sortNameAsc: "Name: A-Z",
      sortNameDesc: "Name: Z-A",
    },
    sk: {
      searchPlaceholder: "Hľadať produkty...",
      typeAll: "Všetky typy",
      typePhysical: "Produkty",
      typeDigital: "Kurzy",
      categoryAll: "Všetky kategórie",
      sortLabel: "Zoradiť",
      sortNewest: "Najnovšie",
      sortPriceAsc: "Cena: Od najlacnejších",
      sortPriceDesc: "Cena: Od najdrahších",
      sortNameAsc: "Názov: A-Z",
      sortNameDesc: "Názov: Z-A",
    }
  };

  const t = dict[lang] || dict.hu;

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-brand-bronze/20 shadow-sm font-montserrat items-center w-full">
      
      {/* Keresés mező */}
      <div className="relative flex-grow w-full md:w-auto md:min-w-[200px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-black/50" />
        <Input 
          placeholder={t.searchPlaceholder} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-11 pr-10 bg-white/80 border-brand-bronze/30 w-full rounded-xl text-brand-black placeholder:text-brand-black/40 h-[46px] focus-visible:ring-1 focus-visible:ring-brand-bronze/50 focus-visible:border-brand-bronze/50"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-brand-black/50 hover:text-brand-brown hover:bg-black/5 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Típus választó */}
      <div className="w-full md:w-[160px] shrink-0">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 [&>span]:truncate [&>span]:block [&>span]:text-left overflow-hidden items-center justify-between">
            <SelectValue placeholder={t.typeAll} />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black">
            <SelectItem value="all" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.typeAll}</SelectItem>
            <SelectItem value="physical" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.typePhysical}</SelectItem>
            <SelectItem value="digital" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.typeDigital}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategória választó */}
      <div className="w-full md:w-[190px] shrink-0">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 [&>span]:truncate [&>span]:block [&>span]:text-left overflow-hidden items-center justify-between">
            <SelectValue placeholder={t.categoryAll} />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black w-[190px]">
            <SelectItem value="all" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.categoryAll}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black truncate">
                {cat.name[lang] || cat.name["hu"] || cat.slug?.[lang] || cat.slug?.["hu"]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rendezés választó */}
      <div className="w-full md:w-[200px] shrink-0">
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 [&>span]:truncate [&>span]:block [&>span]:text-left overflow-hidden items-center justify-between">
            <SelectValue placeholder={t.sortLabel} />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black w-[200px]">
            <SelectItem value="newest" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.sortNewest}</SelectItem>
            <SelectItem value="price-asc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.sortPriceAsc}</SelectItem>
            <SelectItem value="price-desc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.sortPriceDesc}</SelectItem>
            <SelectItem value="name-asc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.sortNameAsc}</SelectItem>
            <SelectItem value="name-desc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.sortNameDesc}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
    </div>
  );
}
