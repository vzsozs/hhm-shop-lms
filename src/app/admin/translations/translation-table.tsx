"use client";

import { useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { EyeOff, Eye, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { toggleTranslationIgnore } from "./actions";
import { TranslationStatusItem } from "@/modules/shop/queries";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface TranslationTableProps {
  data: TranslationStatusItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function TranslationTable({ data, totalCount, currentPage, pageSize }: TranslationTableProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleToggleIgnore = async (id: string, current: boolean) => {
    startTransition(async () => {
      const result = await toggleTranslationIgnore(id, current);
      if (result.success) {
        toast.success(current ? "Felfolcázva" : "Eltávolítva a figyelemfelhívásból");
      } else {
        toast.error(result.error);
      }
    });
  };

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-b-white/10 hover:bg-transparent">
              <TableHead className="text-white font-medium">Termék neve (HU)</TableHead>
              <TableHead className="text-white font-medium text-center">Hiányzó nyelvek</TableHead>
              <TableHead className="text-white font-medium">Hiányzó területek</TableHead>
              <TableHead className="text-white font-medium text-center">Készültség</TableHead>
              <TableHead className="text-white font-medium text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id} 
                className={`border-b-white/5 transition-opacity ${item.ignoreTranslationWarnings ? 'opacity-40 grayscale-sm' : 'hover:bg-white/5'}`}
              >
                <TableCell className="font-medium text-white max-w-[200px] truncate">
                  {item.nameHu}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {item.missingLanguages.map(lang => (
                      <Badge 
                        key={lang} 
                        variant="outline" 
                        className={`uppercase text-[10px] h-5 ${
                          lang === 'hu' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                          lang === 'en' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}
                      >
                        {lang}
                      </Badge>
                    ))}
                    {item.missingLanguages.length === 0 && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">OK</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {item.missingAreas.map(area => (
                      <span key={area} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                        [{area}]
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="w-[180px]">
                  <div className="flex flex-col gap-1.5 items-center">
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${
                          item.readiness > 80 ? 'bg-emerald-500' : 
                          item.readiness > 50 ? 'bg-brand-orange' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.readiness}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-white/50">{item.readiness}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${item.ignoreTranslationWarnings ? 'text-brand-orange' : 'text-white/30 hover:text-white'}`}
                      onClick={() => handleToggleIgnore(item.id, item.ignoreTranslationWarnings)}
                      disabled={isPending}
                      title={item.ignoreTranslationWarnings ? "Jelzés visszakapcsolása" : "Megjelölés nem fontoskánt"}
                    >
                      {item.ignoreTranslationWarnings ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    <Link 
                      href={`/admin/products/${item.id}?focus=${item.missingLanguages[0] || 'hu'}`}
                      className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium bg-white/5 hover:bg-brand-orange hover:text-white rounded-lg transition-all border border-white/10"
                    >
                      Szerkesztés
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-white/30">
                  Nincs megjeleníthető termék a megadott feltételekkel.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-white/40">
            Összesen <span className="text-white/70 font-medium">{totalCount}</span> termék
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft size={16} className="mr-1" /> Előző
            </Button>
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-medium text-white">{currentPage}</span>
              <span className="text-sm text-white/30">/</span>
              <span className="text-sm text-white/30">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Következő <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
