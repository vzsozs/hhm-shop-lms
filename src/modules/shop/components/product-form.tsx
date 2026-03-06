"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useProductForm, ProductFormValues } from "../hooks/use-product-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

interface PendingUpload {
  file: File;
  localUrl: string;
  type: "IMAGE" | "AUDIO";
}

export function ProductForm({ categories = [] }: { categories?: { id: string, name: Record<string, string> }[] }) {
  const { form, isPending, onSubmit, productType, moveMedia, removeMedia } = useProductForm();
  
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup memory on unmount for object URLs
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "AUDIO") => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 1. Generate local previews
    const newPending = files.map(file => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);
      return {
        file,
        localUrl: url,
        type
      };
    });

    setPendingUploads(prev => [...prev, ...newPending]);

    try {
      const uploadPromises = newPending.map(async (item) => {
        const formData = new FormData();
        formData.append("file", item.file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        
        // Cleanup local URL when done
        URL.revokeObjectURL(item.localUrl);
        return { url: data.url as string, type: item.type, localUrl: item.localUrl };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      
      // Remove from pending
      setPendingUploads(prev => prev.filter(p => !newPending.find(np => np.localUrl === p.localUrl)));

      // Add to final form state
      const currentMedia = form.getValues("media") || [];
      const newMediaItems = uploadedResults.filter(res => res.url).map(res => ({ url: res.url, type: res.type }));
      
      form.setValue("media", [...currentMedia, ...newMediaItems]);
    } catch(err) {
      console.error(err);
      newPending.forEach(item => URL.revokeObjectURL(item.localUrl));
      setPendingUploads(prev => prev.filter(p => !newPending.find(np => np.localUrl === p.localUrl)));
    } finally {
      e.target.value = "";
    }
  };

  const currentMedia = form.watch("media") || [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Új termék hozzáadása</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Termék típusa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Válassz típust" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Fizikai termék</SelectItem>
                        <SelectItem value="digital">Digitális termék (LMS)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                 control={form.control}
                 name="status"
                 render={({ field }) => (
                   <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-full shadow-sm">
                     <div className="space-y-0.5">
                       <FormLabel className="text-base">Láthatóság</FormLabel>
                       <p className="text-xs text-muted-foreground">Aktív termékek jelennek meg a boltban.</p>
                     </div>
                     <FormControl>
                       <Switch 
                         checked={field.value === "ACTIVE"} 
                         onCheckedChange={(c) => field.onChange(c ? "ACTIVE" : "INACTIVE")} 
                       />
                     </FormControl>
                   </FormItem>
                 )}
              />
            </div>

            {categories.length > 0 && (
              <FormField
                control={form.control}
                name="categoryIds"
                render={() => (
                  <FormItem className="border rounded-lg p-4 shadow-sm">
                    <div className="mb-4">
                      <FormLabel className="text-base">Kategóriák</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {categories.map((category) => (
                        <FormField
                          key={category.id}
                          control={form.control}
                          name="categoryIds"
                          render={({ field }) => {
                            return (
                              <FormItem key={category.id} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), category.id])
                                        : field.onChange((field.value?.filter((value: string) => value !== category.id)) || [])
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {category.name?.hu || "Kategória"}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Tabs defaultValue="hu" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hu">Magyar</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="sk">Slovensky</TabsTrigger>
              </TabsList>
              
              {(["hu", "en", "sk"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name={`name_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termék neve ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Input placeholder={`Név ${lang}-ul...`} {...field} value={field.value as string || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`shortDescription_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rövid leírás ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Rövid leírás (pl. listanézethez) ${lang}-ul...`} className="resize-none" {...field} value={field.value as string || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`longDescription_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hosszú leírás ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Részletes termékleírás ${lang}-ul...`} className="min-h-[150px]" {...field} value={field.value as string || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU {productType === "physical" && "*"}</FormLabel>
                    <FormControl>
                      <Input placeholder="PL-123-ABC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceHuf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ár (HUF)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceEur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ár (EUR)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {productType === "physical" && (
              <div className="space-y-4 border-t pt-4 mt-4">
                <h3 className="font-semibold">Logisztikai adatok</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Súly (kg) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Szélesség (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Magasság (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mélység (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold">Megjelenési beállítások</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kiemelési sorrend (Prioritás)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="layoutTemplate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Layout Sablon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Válassz sablont" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="VIDEO_CENTERED">Videó központú</SelectItem>
                          <SelectItem value="DOCUMENTARY">Dokumentum jellegű</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-semibold">Média és Fájlok Feltöltése</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <FormItem>
                  <FormLabel>Képek</FormLabel>
                  <FormControl>
                    <Input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload(e, "IMAGE")} />
                  </FormControl>
                </FormItem>

                <FormItem>
                  <FormLabel>Hangfájlok (.mp3)</FormLabel>
                  <FormControl>
                    <Input type="file" accept="audio/mpeg" multiple onChange={(e) => handleFileUpload(e, "AUDIO")} />
                  </FormControl>
                </FormItem>

                <div className="space-y-2">
                  <FormLabel>YouTube Link</FormLabel>
                  <div className="flex gap-2">
                    <Input id="yt-link" placeholder="https://youtube.com/watch?v=..." />
                    <Button type="button" variant="outline" onClick={() => {
                      const input = document.getElementById("yt-link") as HTMLInputElement;
                      if (input && input.value) {
                         const currentMedia = form.getValues("media") || [];
                         form.setValue("media", [...currentMedia, { url: input.value, type: "YOUTUBE" }]);
                         input.value = "";
                      }
                    }}>Hozzáad</Button>
                  </div>
                </div>
              </div>

              {/* Feltöltött média kezelő (Listázás, Törlés, Mozgatás) */}
              {(currentMedia.length > 0 || pendingUploads.length > 0) && (
                <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                  <h4 className="text-sm font-medium">Feltöltött Média Elemek (Sorrend)</h4>
                  <div className="flex flex-col gap-2">
                    {currentMedia.map((m, i) => (
                      <div key={`${m.url}-${i}`} className="flex items-center justify-between bg-background border p-2 rounded shadow-sm text-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="font-mono text-xs text-muted-foreground w-6 text-center">{i + 1}.</span>
                          <span className="font-semibold text-xs tracking-wider uppercase w-16 px-2 py-1 bg-secondary rounded text-center">{m.type}</span>
                          
                          {/* Előnézeti kép (ha IMAGE) */}
                          {m.type === "IMAGE" && (
                            <div className="h-10 w-10 relative overflow-hidden rounded">
                               <Image src={m.url} alt="Kép előnézet" fill className="object-cover" sizes="40px" />
                            </div>
                          )}
                          
                          <span className="truncate max-w-[150px] md:max-w-xs">{m.url.split('/').pop()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveMedia(i, "UP")} disabled={i === 0}>
                            ↑
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => moveMedia(i, "DOWN")} disabled={i === currentMedia.length - 1}>
                            ↓
                          </Button>
                          <Button type="button" variant="destructive" size="sm" className="h-7 px-2 text-xs ml-2" onClick={() => removeMedia(i)}>
                            Törlés
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pending uploads rendering */}
                    {pendingUploads.map((m, i) => (
                      <div key={`pending-${m.localUrl}-${i}`} className="flex flex-col gap-2 bg-muted/80 border border-blue-200 p-2 rounded shadow-sm text-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="font-mono text-xs text-muted-foreground w-6 text-center">-</span>
                            <span className="font-semibold text-xs tracking-wider uppercase w-16 px-2 py-1 bg-blue-100 text-blue-700 rounded text-center">{m.type}</span>
                            
                            {m.type === "IMAGE" && (
                              <div className="h-10 w-10 relative rounded overflow-hidden">
                                <img src={m.localUrl} alt="local preview" className="object-cover w-full h-full opacity-50" />
                              </div>
                            )}

                            <span className="truncate max-w-[150px] md:max-w-xs text-muted-foreground">{m.file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 pr-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            <span className="text-xs text-blue-500 font-medium">Feltöltés...</span>
                          </div>
                        </div>
                        {/* Overlay áttetsző réteg a teljes elemen */}
                        <div className="absolute inset-0 bg-white/40 pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Mentés..." : "Termék mentése"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
