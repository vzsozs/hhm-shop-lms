"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductDetailItem } from "@/modules/shop/queries";
import { FileText, List } from "lucide-react";

interface ProductContentProps {
  product: ProductDetailItem;
  lang?: "hu" | "en" | "sk";
}

export function ProductContent({ product, lang = "hu" }: ProductContentProps) {
  const [activeTab, setActiveTab] = useState<string>("description");

  // A nyelv szerinti szöveg kiszedése, ha nincs, fallback az első elérhető nyelvre vagy üres stringre
  const getLocalizedText = (jsonbMap: Record<string, string> | null) => {
    if (!jsonbMap) return "";
    return jsonbMap[lang] || jsonbMap["hu"] || Object.values(jsonbMap)[0] || "";
  };

  const description = getLocalizedText(product.description);
  
  // A specs lehet szimpla key-value (string: string) vagy komplexebb JSON.
  // Megpróbáljuk Record<string, string>-ként kezelni a kiírást egy táblázatban.
  const hasSpecs = product.specs && Object.keys(product.specs).length > 0;

  return (
    <div className="mt-12 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0 h-14">
          <TabsTrigger 
            value="description" 
            className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-6 font-medium"
          >
            <FileText className="w-4 h-4 mr-2" />
            Részletes Leírás
          </TabsTrigger>
          {hasSpecs && (
            <TabsTrigger 
              value="specs" 
              className="rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none px-6 font-medium"
            >
              <List className="w-4 h-4 mr-2" />
              Specifikációk
            </TabsTrigger>
          )}
        </TabsList>
        
        <div className="p-6 sm:p-8">
          <TabsContent value="description" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            {description ? (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-primary whitespace-pre-wrap"
                // Ha a jövőben Rich Text Editort használnak, itt dangerouslySetInnerHTML is lehet, de most sima string:
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                Nincs elérhető leírás ehhez a termékhez {lang.toUpperCase()} nyelven.
              </p>
            )}
          </TabsContent>

          {hasSpecs && (
            <TabsContent value="specs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                  <tbody className="divide-y divide-border">
                    {Object.entries(product.specs as Record<string, any>).map(([key, val], idx) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        <td className="w-1/3 py-3 px-4 font-medium text-muted-foreground border-r bg-muted/20">
                          {key}
                        </td>
                        <td className="py-3 px-4">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
