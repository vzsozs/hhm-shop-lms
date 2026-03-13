"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Layers, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "use-debounce"; 

type CategoryItem = { id: string; name: Record<string, string>; slug: Record<string, string> };

interface ProductFiltersProps {
  initialSearch?: string;
  initialBadge?: string;
  initialCategoryId?: string;
  initialSort?: string;
  categories: CategoryItem[];
  badgeSettings: any[];
  lang: string;
}

export function ProductFilters({ 
  initialSearch = "", 
  initialBadge = "all", 
  initialCategoryId = "all",
  initialSort = "newest",
  categories,
  badgeSettings,
  lang
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [badge, setBadge] = useState(initialBadge || "all");
  const [categoryId, setCategoryId] = useState(initialCategoryId || "all");
  const [sort, setSort] = useState(initialSort || "newest");

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

    // Badge
    const currentBadge = params.get("badge") || "all";
    if (badge !== "all" && badge !== currentBadge) {
      params.set("badge", badge);
      hasChanges = true;
    } else if (badge === "all" && params.has("badge")) {
      params.delete("badge");
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
  }, [debouncedSearchTerm, badge, categoryId, sort, pathname, router, searchParams]);

  const dict: Record<string, Record<string, string>> = {
    hu: {
      searchPlaceholder: "Keresés a termékek között...",
      badgeAll: "Minden tulajdonság",
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
      badgeAll: "All Attributes",
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
      badgeAll: "Všetky vlastnosti",
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

      {/* Szűrők csoportja (Mobilon egymás mellett) */}
      <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-3 shrink-0">
        {/* Badge választó (Típus helyett) */}
        <div className="w-full md:w-[180px] shrink-0">
          <Select value={badge} onValueChange={setBadge}>
            <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[68px] md:h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 px-3 py-2 md:px-3 md:py-2 whitespace-normal md:whitespace-nowrap [&_[data-slot=select-value]]:line-clamp-2 md:[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:leading-[1.1] md:[&_[data-slot=select-value]]:leading-normal [&_[data-slot=select-value]]:whitespace-normal md:[&_[data-slot=select-value]]:whitespace-nowrap text-[11px] sm:text-[14px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Filter className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <SelectValue placeholder={t.badgeAll} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black">
              <SelectItem value="all" className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">{t.badgeAll}</SelectItem>
              {badgeSettings.map((bs) => (
                <SelectItem key={bs.id} value={bs.iconName} className="focus:bg-brand-lightbg focus:text-brand-brown py-2 cursor-pointer text-brand-black">
                  {bs.tooltips[lang] || bs.tooltips["hu"] || bs.iconName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kategória választó */}
        <div className="w-full md:w-[170px] shrink-0">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[68px] md:h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 px-3 py-2 md:px-3 md:py-2 whitespace-normal md:whitespace-nowrap [&_[data-slot=select-value]]:line-clamp-2 md:[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:leading-[1.1] md:[&_[data-slot=select-value]]:leading-normal [&_[data-slot=select-value]]:whitespace-normal md:[&_[data-slot=select-value]]:whitespace-nowrap text-[11px] sm:text-[14px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <Layers className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <SelectValue placeholder={t.categoryAll} />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white border-brand-bronze/20 rounded-xl shadow-lg text-brand-black w-[200px]">
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
        <div className="w-full md:w-[170px] shrink-0">
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full bg-white/80 border-brand-bronze/30 text-brand-black h-[68px] md:h-[46px] rounded-xl focus:ring-1 focus:ring-brand-bronze/50 px-3 py-2 md:px-3 md:py-2 whitespace-normal md:whitespace-nowrap [&_[data-slot=select-value]]:line-clamp-2 md:[&_[data-slot=select-value]]:line-clamp-1 [&_[data-slot=select-value]]:leading-[1.1] md:[&_[data-slot=select-value]]:leading-normal [&_[data-slot=select-value]]:whitespace-normal md:[&_[data-slot=select-value]]:whitespace-nowrap text-[11px] sm:text-[14px]">
              <div className="flex items-center gap-1.5 min-w-0">
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <SelectValue placeholder={t.sortLabel} />
              </div>
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
      
    </div>
  );
}
