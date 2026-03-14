"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle,
  ArrowUpDown,
  Search
} from "lucide-react";
import { ProductActions } from "./product-actions";
import { toast } from "sonner";
import { deleteProducts, updateProductsStatus } from "@/modules/shop/actions";

interface ProductListItem {
  id: string;
  name: Record<string, string>; // { hu: string, en: string, sk: string }
  createdAt: string | Date;
  status: "ACTIVE" | "INACTIVE";
  priority: number;
  image?: string | null;
  price: number;
  categoryName?: Record<string, string>; // JSONB category name
}

interface ProductTableClientProps {
  products: ProductListItem[];
}

interface SortLinkProps {
  column: string;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  currentSort: string | null;
  currentOrder: string | null;
  pathname: string;
  searchParams: URLSearchParams;
}

const SortLink = ({ column, children, align = "left", currentSort, currentOrder, pathname, searchParams }: SortLinkProps) => {
  const isCurrent = currentSort === column;
  const targetOrder = isCurrent && currentOrder === "asc" ? "desc" : "asc";
  const justifyClass = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  
  const params = new URLSearchParams(searchParams.toString());
  params.set("sort", column);
  params.set("order", targetOrder);

  return (
    <Link href={`${pathname}?${params.toString()}`} className={`flex items-center gap-1 hover:text-white/80 transition-colors w-full ${justifyClass}`}>
      {children}
      <ArrowUpDown className={`h-3.5 w-3.5 ${isCurrent ? 'text-brand-orange' : 'text-white/30'}`} />
    </Link>
  );
};

export function ProductTableClient({ products }: ProductTableClientProps) {
  const searchParams = useSearchParams();
  const searchParamsObj = new URLSearchParams(searchParams.toString());
  const pathname = usePathname();
  const router = useRouter();

  const q = searchParams.get("q") || "";
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState(q);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length && products.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    
    if (confirm(`Biztosan törölni szeretnél ${selectedIds.length} kijelölt terméket? Ez a művelet nem vonható vissza.`)) {
      startTransition(async () => {
        const result = await deleteProducts(selectedIds);
        if (result.success) {
          toast.success(`${selectedIds.length} termék sikeresen törölve!`);
          setSelectedIds([]);
        } else {
          toast.error(result.error || "Hiba történt a törlés során.");
        }
      });
    }
  };

  const handleBulkStatusUpdate = (status: "ACTIVE" | "INACTIVE") => {
    if (selectedIds.length === 0) return;
    
    startTransition(async () => {
      const result = await updateProductsStatus(selectedIds, status);
      if (result.success) {
        toast.success(`Státusz sikeresen módosítva ${selectedIds.length} terméknél!`);
        setSelectedIds([]);
      } else {
        toast.error(result.error || "Hiba történt a módosítás során.");
      }
    });
  };


  return (
    <div className="space-y-4">
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-brand-orange rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {selectedIds.length}
            </div>
            <span className="text-white font-medium text-sm">termék kijelölve</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate("ACTIVE")}
              disabled={isPending}
              className="px-4 h-9 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">Aktiválás</span>
            </button>
            <button
              onClick={() => handleBulkStatusUpdate("INACTIVE")}
              disabled={isPending}
              className="px-4 h-9 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle size={16} />
              <span className="hidden sm:inline">Piszkozat</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={handleBulkDelete}
              disabled={isPending}
              className="px-4 h-9 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span className="hidden sm:inline">Törlés</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 text-white/30 hover:text-white transition-colors"
              title="Mégse"
            >
              <XCircle size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden block">
        <Table>
          <TableHeader className="bg-white/5 hover:bg-white/5">
            <TableRow className="border-b-white/10 hover:bg-transparent">
              <TableHead className="w-[40px] px-4">
                <Checkbox 
                  checked={selectedIds.length === products.length && products.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Összes kijelölése"
                  className="border-white/20 data-[state=checked]:bg-brand-orange data-[state=checked]:border-brand-orange"
                />
              </TableHead>
              <TableHead className="text-white/50 w-[80px]">Kép</TableHead>
              <TableHead className="text-white">
                <div className="flex items-center gap-4 py-2">
                  <div className="shrink-0">
                    <SortLink column="name" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Név</SortLink>
                  </div>
                  <div className="relative group max-w-[200px] w-full">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-brand-orange transition-colors" />
                    <Input                       
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Keresés..."
                      className="h-6 pl-6 bg-white/5 border-white/10 text-xxs focus:border-brand-orange/50 focus:ring-brand-orange/20 transition-all rounded-l"
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className="text-white text-right">
                <SortLink column="date" align="right" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Hozzáadva</SortLink>
              </TableHead>
              <TableHead className="text-white text-right">
                <SortLink column="price" align="right" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Ár (Tól)</SortLink>
              </TableHead>
              <TableHead className="text-white text-center">
                <SortLink column="priority" align="center" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Sorrend</SortLink>
              </TableHead>
              <TableHead className="text-white">
                <SortLink column="category" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Kategória</SortLink>
              </TableHead>
              <TableHead className="text-white text-center">
                <SortLink column="status" align="center" currentSort={sort} currentOrder={order} pathname={pathname} searchParams={searchParamsObj}>Státusz</SortLink>
              </TableHead>
              <TableHead className="text-white text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const nameHu = (product.name as Record<string, string>)?.hu || "Névtelen";
              const catNameHu = product.categoryName?.hu || "Nincs kategória";
              const priceDisp = product.price ? product.price.toLocaleString("hu-HU") : "0";
              const dateAdded = new Date(product.createdAt).toLocaleDateString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric' });
              const isSelected = selectedIds.includes(product.id);

              return (
                <TableRow 
                  key={product.id} 
                  className={`border-b-white/5 transition-colors ${isSelected ? "bg-brand-orange/5" : "hover:bg-white/5"}`}
                >
                  <TableCell className="px-4">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(product.id)}
                      aria-label={`${nameHu} kijelölése`}
                      className="border-white/20 data-[state=checked]:bg-brand-orange data-[state=checked]:border-brand-orange"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-10 bg-white/10 rounded-lg flex items-center justify-center text-white/30 shrink-0 overflow-hidden relative">
                      {product.image ? (
                        <Image 
                          src={product.image} 
                          alt={nameHu} 
                          fill 
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white whitespace-normal">
                    <div className="line-clamp-2 max-w-[220px] text-sm leading-snug" title={nameHu}>{nameHu}</div>
                  </TableCell>
                  <TableCell className="text-right text-white/70 text-sm whitespace-nowrap">{dateAdded}</TableCell>
                  <TableCell className="text-right text-white font-medium">{priceDisp} Ft</TableCell>
                  <TableCell className="text-center text-white/70">{product.priority}</TableCell>
                  <TableCell className="text-white/70">{catNameHu}</TableCell>
                  <TableCell className="text-center">
                    {product.status === "ACTIVE" ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Aktív</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-white/10 text-white/60 border-white/20">Piszkozat</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <ProductActions productId={product.id} />
                  </TableCell>
                </TableRow>
              );
            })}
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-white/50">
                  {searchTerm ? "Nincs a keresésnek megfelelő termék." : "Nincsenek termékek az adatbázisban."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
