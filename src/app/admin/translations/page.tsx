import { fetchTranslationStatus } from "./actions";
import { TranslationTable } from "./translation-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Globe, AlertTriangle } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdminTranslationsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ filter?: string, page?: string }> 
}) {
  const params = await searchParams;
  const filter = params.filter as "hu" | "en" | "sk" | "all" | undefined;
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  const result = await fetchTranslationStatus({
    langMissing: filter,
    page,
    limit: pageSize
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Globe className="text-brand-orange" size={28} />
            Fordítások kezelése
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Termékek fordítási hiányosságainak feltárása és javítása
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
          <Tabs defaultValue={filter || "all"} className="w-full sm:w-auto">
            <TabsList className="bg-white/5 border border-white/10 p-1 h-12 rounded-xl">
              <Link href="?filter=all">
                <TabsTrigger value="all" className="rounded-lg px-4 h-full data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                  Összes hiányos
                </TabsTrigger>
              </Link>
              <Link href="?filter=hu">
                <TabsTrigger value="hu" className="rounded-lg px-4 h-full data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                  Csak a HU hiányzik
                </TabsTrigger>
              </Link>
              <Link href="?filter=en">
                <TabsTrigger value="en" className="rounded-lg px-4 h-full data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                  Csak az EN hiányzik
                </TabsTrigger>
              </Link>
              <Link href="?filter=sk">
                <TabsTrigger value="sk" className="rounded-lg px-4 h-full data-[state=active]:bg-brand-orange data-[state=active]:text-white">
                  Csak az SK hiányzik
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
            <AlertTriangle size={14} />
            <span>HU/EN/SK nyelvek ellenőrzése</span>
          </div>
        </div>

        <Suspense fallback={<div className="h-64 flex items-center justify-center text-white/30">Betöltés...</div>}>
          <TranslationTable 
            data={result.items} 
            totalCount={result.totalCount}
            currentPage={page}
            pageSize={pageSize}
          />
        </Suspense>
      </div>
    </div>
  );
}
