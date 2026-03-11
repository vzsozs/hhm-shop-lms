"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { uploadMeinlFile } from "@/app/actions/meinl-sync";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type SyncResult = {
  success: boolean;
  processed?: number;
  updated?: number;
  inserted?: number;
  deactivated?: number;
  successSkus?: string[];
  errorSkus?: { sku: string; error: string }[];
  skippedSkus?: string[];
  error?: string;
  errors?: string[];
};

export function MeinlSyncButton() {
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      toast.error("Csak CSV vagy Excel fájl tölthető fel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const loadingToast = toast.loading("Meinl adatok szinkronizálása folyamatban...");

    try {
      const result = await uploadMeinlFile(formData);

      if (result.success) {
        setSyncResult(result);
        setShowModal(true);
        toast.success(`Sikeres szinkronizáció!`, {
          id: loadingToast,
          description: `Feldolgozva: ${result.processed}, Új: ${result.inserted}, Frissítve: ${result.updated}, Inaktív: ${result.deactivated}`,
          duration: 3000,
        });
      } else {
        toast.error(result.error || "Hiba történt a feltöltés során.", { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Váratlan hiba történt.", { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv, .xlsx, .xls"
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        className="px-4 h-10 bg-white/5 hover:bg-white/10 border-white/10 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-colors shadow-lg"
      >
        {isUploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <FileSpreadsheet size={18} className="text-brand-orange" />
        )}
        Meinl adatok feltöltése
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-zinc-900 border-zinc-800 text-white overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="text-brand-orange" />
              Szinkronizáció Eredménye
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              A szinkronizációs folyamat befejeződött. Az alábbiakban látható a részletes napló.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4 border-y border-zinc-800 my-4">
            <div className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">Feldolgozva</span>
              <span className="text-xl font-bold">{syncResult?.processed || 0}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-green-900/20 rounded-lg">
              <span className="text-green-400 text-xs uppercase tracking-wider">Új</span>
              <span className="text-xl font-bold text-green-400">{syncResult?.inserted || 0}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-900/20 rounded-lg">
              <span className="text-blue-400 text-xs uppercase tracking-wider">Frissítve</span>
              <span className="text-xl font-bold text-blue-400">{syncResult?.updated || 0}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-zinc-800/50 rounded-lg">
              <span className="text-zinc-400 text-xs uppercase tracking-wider">Inaktív</span>
              <span className="text-xl font-bold">{syncResult?.deactivated || 0}</span>
            </div>
          </div>

          <Tabs defaultValue="success" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="bg-zinc-800/50 border border-zinc-700 w-full justify-start p-1 h-auto rounded-lg">
              <TabsTrigger 
                value="success" 
                className="rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white flex gap-2"
              >
                Sikeres <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-none">{syncResult?.successSkus?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="errors" 
                className="rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white flex gap-2"
              >
                Hibák <Badge variant="secondary" className="bg-red-500/20 text-red-400 border-none">{syncResult?.errorSkus?.length || 0}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="skipped" 
                className="rounded-md data-[state=active]:bg-zinc-700 data-[state=active]:text-white flex gap-2"
              >
                Kihagyva <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 border-none">{syncResult?.skippedSkus?.length || 0}</Badge>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <TabsContent value="success" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">SKU (Cikkszám)</TableHead>
                      <TableHead className="text-zinc-400 text-right">Státusz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncResult?.successSkus?.length ? (
                      syncResult.successSkus.map((sku) => (
                        <TableRow key={sku} className="border-zinc-800 hover:bg-zinc-800/20">
                          <TableCell className="font-medium">{sku}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5 text-[10px] py-0">SIKERES</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={2} className="text-center py-8 text-zinc-500">Nincs sikeresen feldolgozott tétel.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="errors" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">SKU (Cikkszám)</TableHead>
                      <TableHead className="text-zinc-400 w-[60%]">Hibaüzenet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncResult?.errorSkus?.length ? (
                      syncResult.errorSkus.map((err, idx) => (
                        <TableRow key={`${err.sku}-${idx}`} className="border-zinc-800 hover:bg-zinc-800/20">
                          <TableCell className="font-medium text-red-400">{err.sku}</TableCell>
                          <TableCell className="text-red-400/80 text-sm whitespace-pre-wrap">{err.error}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={2} className="text-center py-8 text-zinc-500">Nincs hibaüzenet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="skipped" className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">SKU / Megjegyzés</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncResult?.skippedSkus?.length ? (
                      syncResult.skippedSkus.map((sku, idx) => (
                        <TableRow key={`${sku}-${idx}`} className="border-zinc-800 hover:bg-zinc-800/20">
                          <TableCell className="text-zinc-400">{sku}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell className="text-center py-8 text-zinc-500">Nincs kihagyott tétel.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #52525b;
        }
      `}</style>
    </>
  );
}
