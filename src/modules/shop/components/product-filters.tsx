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

type CategoryItem = { id: string; name: Record<string, string>; slug: string };

interface ProductFiltersProps {
  initialSearch?: string;
  initialType?: "physical" | "digital";
  initialCategoryId?: string;
  categories: CategoryItem[];
  lang: string;
}

export function ProductFilters({ 
  initialSearch = "", 
  initialType, 
  initialCategoryId = "all",
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

    if (hasChanges) {
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchTerm, type, categoryId, pathname, router, searchParams]);

  return (
    <div className="flex flex-col md:flex-row gap-4 bg-muted/40 p-4 rounded-xl border">
      
      {/* Keresés mező */}
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Keresés termékek között..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10 bg-background w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchTerm("")}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Típus választó */}
      <div className="w-full md:w-48">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Minden Típus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Minden Típus</SelectItem>
            <SelectItem value="physical">Fizikai</SelectItem>
            <SelectItem value="digital">Digitális</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kategória választó */}
      <div className="w-full md:w-56">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Összes Kategória" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Összes Kategória</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name[lang] || cat.name["hu"] || cat.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
    </div>
  );
}
