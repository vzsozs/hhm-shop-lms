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

  return (
    <div className="flex flex-col md:flex-row flex-wrap gap-3 bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-brand-bronze/20 shadow-sm font-montserrat items-center w-full">
      
      {/* Keresés mező */}
      <div className="relative flex-grow w-full md:w-auto md:min-w-[200px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-black/50" />
        <Input 
          placeholder="Keresés termékek között..." 
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
            <SelectValue placeholder="Minden Típus" />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black">
            <SelectItem value="all" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Minden Típus</SelectItem>
            <SelectItem value="physical" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Termékek</SelectItem>
            <SelectItem value="digital" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Tanfolyamok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategória választó */}
      <div className="w-full md:w-[190px] shrink-0">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 [&>span]:truncate [&>span]:block [&>span]:text-left overflow-hidden items-center justify-between">
            <SelectValue placeholder="Összes Kategória" />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black w-[190px]">
            <SelectItem value="all" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Összes Kategória</SelectItem>
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
            <SelectValue placeholder="Rendezés" />
          </SelectTrigger>
          <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black w-[200px]">
            <SelectItem value="newest" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Legújabb elöl</SelectItem>
            <SelectItem value="price-asc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Ár: Olcsótól drágábbra</SelectItem>
            <SelectItem value="price-desc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Ár: Drágától olcsóbbra</SelectItem>
            <SelectItem value="name-asc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Név: A-Z</SelectItem>
            <SelectItem value="name-desc" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">Név: Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
    </div>
  );
}
