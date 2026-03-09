"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useFieldArray } from "react-hook-form";
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
import { 
  Loader2, 
  Plus, 
  Trash2, 
  Search, 
  ChevronUp, 
  ChevronDown,
  Image as ImageIcon,
  Music,
  FileText
} from "lucide-react";
import { productFormStyles as styles } from "./product-form.styles";

interface PendingUpload {
  file: File;
  localUrl: string;
  type: "IMAGE" | "AUDIO" | "DOCUMENT";
}

export function ProductForm({ categories = [], products = [], initialData, productId }: { categories?: { id: string, name: Record<string, string> }[], products?: { id: string, name: Record<string, string> }[], initialData?: Partial<ProductFormValues>, productId?: string }) {
  const { form, isPending, onSubmit, productType, moveMedia, removeMedia } = useProductForm(initialData, productId);
  const isEditMode = !!initialData;
  
  const { fields: variantFields } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control: form.control,
    name: "specifications",
  });

  const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment } = useFieldArray({
    control: form.control,
    name: "attachments",
  });
  
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [familySearch, setFamilySearch] = useState("");
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup memory on unmount for object URLs
  useEffect(() => {
    const activeUrls = objectUrlsRef.current;
    return () => {
      activeUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "AUDIO" | "DOCUMENT") => {
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
      const newMediaItems = uploadedResults.filter(res => res.url && res.type !== "DOCUMENT").map(res => ({ url: res.url, type: res.type as "IMAGE" | "AUDIO" | "YOUTUBE" }));
      if (newMediaItems.length > 0) {
        const currentMedia = form.getValues("media") || [];
        form.setValue("media", [...currentMedia, ...newMediaItems]);
      }

      // Add to attachments
      const newAttachments = uploadedResults.filter(res => res.url && res.type === "DOCUMENT");
      newAttachments.forEach(att => {
        const fileObj = newPending.find(p => p.localUrl === att.localUrl)?.file;
        appendAttachment({ url: att.url, name: fileObj?.name || "Dokumentum" });
      });
      
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className={styles.container}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>{isEditMode ? "Termék szerkesztése" : "Új termék hozzáadása"}</CardTitle>
            <div className="flex items-center gap-6">
              <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <div className="space-y-0.5 text-right">
                        <FormLabel className="text-sm font-semibold text-white cursor-pointer">Láthatóság</FormLabel>
                        <p className="text-xs text-white/50 m-0">Aktív a boltban</p>
                      </div>
                      <FormControl>
                        <Switch 
                          checked={field.value === "ACTIVE"} 
                          onCheckedChange={(c) => field.onChange(c ? "ACTIVE" : "INACTIVE")} 
                          className={styles.switch}
                        />
                      </FormControl>
                    </FormItem>
                  )}
              />
              <Button type="submit" className={styles.primaryButton} disabled={isPending}>
                {isPending ? "Mentés..." : (isEditMode ? "Változtatások mentése" : "Termék mentése")}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Típus, Sablon, Láthatóság Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className={styles.sectionContent}>
                    <FormLabel className={styles.label}>Termék típusa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={`${styles.inputWrapper} h-11`}>
                          <SelectValue placeholder="Válassz típust" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-admin-bg border-white/10 text-white">
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
                  name="layoutTemplate"
                  render={({ field }) => (
                    <FormItem className={styles.sectionContent}>
                      <FormLabel className={styles.label}>Layout sablon</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={`${styles.inputWrapper} h-11`}>
                            <SelectValue placeholder="Válassz sablont" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-bg border-white/10 text-white">
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="VIDEO_CENTERED">Videó központú</SelectItem>
                          <SelectItem value="DOCUMENTARY">Dokumentum jellegű</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className={styles.sectionContent}>
                    <FormLabel className={styles.label}>Sorrend</FormLabel>
                    <FormControl>
                      <Input type="number" className={`${styles.inputWrapper} ${styles.input} h-11`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nyelvi fülek */}
            <Tabs defaultValue="hu" className="w-full">
              <TabsList className={styles.tabsList}>
                <TabsTrigger value="hu" className={styles.tabsTrigger}>Magyar</TabsTrigger>
                <TabsTrigger value="en" className={styles.tabsTrigger}>English</TabsTrigger>
                <TabsTrigger value="sk" className={styles.tabsTrigger}>Slovensky</TabsTrigger>
              </TabsList>
              
              {(["hu", "en", "sk"] as const).map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4 pt-4">
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name={`name_${lang}` as keyof ProductFormValues}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className={styles.label}>Termék neve ({lang.toUpperCase()})</FormLabel>
                          <FormControl>
                            <Input placeholder={`Név ${lang}-ul...`} className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`shortDescription_${lang}` as keyof ProductFormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.label}>Rövid leírás ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Rövid leírás (pl. listanézethez) ${lang}-ul...`} className={`resize-none ${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} />
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
                        <FormLabel className={styles.label}>Hosszú leírás ({lang.toUpperCase()})</FormLabel>
                        <FormControl>
                          <Textarea placeholder={`Részletes termékleírás ${lang}-ul...`} className={`min-h-[150px] ${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Variációk */}
            <div>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Árazás és Készlet</h3>
              </div>
              
              <div className="space-y-4">
                {variantFields.slice(0, 1).map((field, index) => (
                  <div key={field.id} className={styles.sectionContent}>
                    
                    {/* Rejtett mező az adatbázis ID megőrzésére, különben a React Hook Form felülírja! */}
                    <input type="hidden" {...form.register(`variants.${index}.id` as const)} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:grid-cols-4 items-start">
                      <FormField control={form.control} name={`variants.${index}.name_hu`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>Variáció Neve (HU)</FormLabel><FormControl><Input placeholder="pl. Kicsi" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`variants.${index}.name_en`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>Variáció Neve (EN)</FormLabel><FormControl><Input placeholder="eg. Small" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`variants.${index}.name_sk`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>Variáció Neve (SK)</FormLabel><FormControl><Input placeholder="napr. Malý" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {/* Üres div a negyedik helyre, hogy igazodjon a lenti 4-es gridhez */}
                      <div className="hidden md:block"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                      <FormField control={form.control} name={`variants.${index}.sku`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>SKU *</FormLabel><FormControl><Input placeholder="Cikkszám" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`variants.${index}.priceHuf`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>Ár (HUF) *</FormLabel><FormControl><Input type="number" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`variants.${index}.priceEur`} render={({ field }) => (
                        <FormItem><FormLabel className={styles.label}>Ár (EUR) *</FormLabel><FormControl><Input type="number" step="0.01" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    {productType === "physical" && (
                      <div className="grid grid-cols-4 gap-4 items-start">
						<FormField control={form.control} name={`variants.${index}.weight`} render={({ field }) => (
                          <FormItem><FormLabel className={styles.label}>Súly (g)</FormLabel><FormControl><Input type="number" step="0.1" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`variants.${index}.width`} render={({ field }) => (
                          <FormItem><FormLabel className={styles.label}>Szélesség (mm)</FormLabel><FormControl><Input type="number" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`variants.${index}.height`} render={({ field }) => (
                          <FormItem><FormLabel className={styles.label}>Magasság (mm)</FormLabel><FormControl><Input type="number" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`variants.${index}.depth`} render={({ field }) => (
                          <FormItem><FormLabel className={styles.label}>Mélység (mm)</FormLabel><FormControl><Input type="number" className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value as number || 0} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dinamikus Specifikációk */}
            <div>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Dinamikus specifikációk</h3>
                <Button type="button" onClick={() => appendSpec({ key_hu: "", value_hu: "", key_en: "", value_en: "", key_sk: "", value_sk: "" })} className={styles.iconAddBtn}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {specFields.map((field, index) => (
                  <div key={field.id} className={styles.sectionContent}>
                    <Button type="button" className={`absolute top-4 right-4 ${styles.iconDeleteBtn}`} onClick={() => removeSpec(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:grid-cols-2 h-full items-start">
                      <FormField control={form.control} name={`specifications.${index}.key_hu`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Tulajdonság (HU)</FormLabel><FormControl><Input placeholder="pl. Anyag" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`specifications.${index}.value_hu`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Érték (HU)</FormLabel><FormControl><Input placeholder="pl. Bronz" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      
                      <FormField control={form.control} name={`specifications.${index}.key_en`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Tulajdonság (EN)</FormLabel><FormControl><Input placeholder="eg. Material" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`specifications.${index}.value_en`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Érték (EN)</FormLabel><FormControl><Input placeholder="eg. Bronze" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      
                      <FormField control={form.control} name={`specifications.${index}.key_sk`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Tulajdonság (SK)</FormLabel><FormControl><Input placeholder="napr. Materiál" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`specifications.${index}.value_sk`} render={({ field }) => (
                        <FormItem className="h-full"><FormLabel className={styles.label}>Érték (SK)</FormLabel><FormControl><Input placeholder="napr. Bronz" className={`${styles.inputWrapper} ${styles.input} h-full`} {...field} value={field.value as string || ""} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                ))}
                {specFields.length === 0 && <p className="text-sm text-white/50">Nincsenek megadva specifikációk.</p>}
              </div>
            </div>

            {/* Kategóriák */}
            {categories.length > 0 && (
              <div className="space-y-4">
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Kategóriák</h3>
                </div>
                <FormField
                  control={form.control}
                  name="categoryIds"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start bg-admin-bg p-4 rounded-xl">
                        {categories.map((category) => (
                          <FormField
                            key={category.id}
                            control={form.control}
                            name="categoryIds"
                            render={({ field }) => {
                              return (
                                <FormItem key={category.id}>
                                  <FormLabel className={`${styles.checkboxItem} w-full m-0`}>
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), category.id])
                                            : field.onChange((field.value?.filter((value: string) => value !== category.id)) || [])
                                        }}
                                        className={styles.checkbox}
                                      />
                                    </FormControl>
                                    <span className="font-normal cursor-pointer text-white/80">
                                      {category.name?.hu || "Kategória"}
                                    </span>
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
              </div>
            )}

            {/* Média */}
            <div>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Média és Fájlok feltöltése</h3>
              </div>
              <div className={styles.sectionContent}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:grid-cols-4 mb-6">
                  <div className="relative">
                    <Button type="button" variant="outline" className={`w-full justify-start text-white bg-brand-orange border-none hover:bg-brand-orange/90 rounded-full pl-4 pr-12`} onClick={() => document.getElementById('image-upload')?.click()}>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Kép
                    </Button>
                    <div className="absolute right-0 top-0 bottom-0 bg-white/20 rounded-r-full flex items-center justify-center w-10 pointer-events-none">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <Input id="image-upload" type="file" accept="image/*" multiple onChange={(e) => handleFileUpload(e, "IMAGE")} className="hidden" />
                  </div>

                  <div className="relative">
                    <Button type="button" variant="outline" className={`w-full justify-start text-white bg-brand-orange border-none hover:bg-brand-orange/90 rounded-full pl-4 pr-12`} onClick={() => document.getElementById('audio-upload')?.click()}>
                      <Music className="h-4 w-4 mr-2" />
                      Hang
                    </Button>
                    <div className="absolute right-0 top-0 bottom-0 bg-white/20 rounded-r-full flex items-center justify-center w-10 pointer-events-none">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <Input id="audio-upload" type="file" accept="audio/mpeg" multiple onChange={(e) => handleFileUpload(e, "AUDIO")} className="hidden" />
                  </div>

                  <div className="relative">
                    <Button type="button" variant="outline" className={`w-full justify-start text-white bg-brand-orange border-none hover:bg-brand-orange/90 rounded-full pl-4 pr-12`} onClick={() => document.getElementById('pdf-upload')?.click()}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <div className="absolute right-0 top-0 bottom-0 bg-white/20 rounded-r-full flex items-center justify-center w-10 pointer-events-none">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <Input id="pdf-upload" type="file" accept="application/pdf" multiple onChange={(e) => handleFileUpload(e, "DOCUMENT")} className="hidden" />
                  </div>

                  <div className="flex relative">
                    <Input id="yt-link" placeholder="https://youtube.com..." className={`rounded-full pr-10 ${styles.inputWrapper} ${styles.input}`} />
                    <Button type="button" className={`absolute right-1 top-1 bottom-1 ${styles.iconAddBtn} w-7 h-7`} onClick={() => {
                      const input = document.getElementById("yt-link") as HTMLInputElement;
                      if (input && input.value) {
                         const currentMedia = form.getValues("media") || [];
                         form.setValue("media", [...currentMedia, { url: input.value, type: "YOUTUBE" }]);
                         input.value = "";
                      }
                    }}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Uploaded Media items */}
                {(currentMedia.length > 0 || pendingUploads.length > 0) && (
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <h4 className="text-sm font-medium text-white/70">Feltöltött média elemek (sorrend)</h4>
                    <div className="flex flex-col gap-2">
                      {currentMedia.map((m, i) => (
                        <div key={`${m.url}-${i}`} className={styles.mediaRow}>
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="font-mono text-xs text-white/50 w-6 text-center">{i + 1}.</span>
                            <span className="font-semibold text-xs tracking-wider uppercase w-16 px-2 py-1 bg-white/10 rounded text-center text-white/80">{m.type}</span>
                            
                            {m.type === "IMAGE" && (
                              <div className="h-10 w-10 relative overflow-hidden rounded bg-black/20">
                                 <Image src={m.url} alt="Kép előnézet" fill className="object-cover" sizes="40px" />
                              </div>
                            )}
                            
                            <span className="truncate max-w-[150px] md:max-w-xs text-white/80">{m.url.split('/').pop()?.substring(0, 30)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10 hover:text-white text-white/50" onClick={() => moveMedia(i, "UP")} disabled={i === 0}>
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10 hover:text-white text-white/50" onClick={() => moveMedia(i, "DOWN")} disabled={i === currentMedia.length - 1}>
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button type="button" className={`${styles.iconDeleteBtn} ml-2`} onClick={() => removeMedia(i)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {pendingUploads.map((m, i) => (
                        <div key={`pending-${m.localUrl}-${i}`} className={`${styles.mediaRow} relative overflow-hidden opacity-70`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <span className="font-mono text-xs text-white/50 w-6 text-center">-</span>
                              <span className="font-semibold text-xs tracking-wider uppercase w-16 px-2 py-1 bg-white/10 rounded text-center">{m.type}</span>
                              
                              {m.type === "IMAGE" && (
                                <div className="h-10 w-10 relative rounded overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={m.localUrl} alt="local preview" className="object-cover w-full h-full opacity-50" />
                                </div>
                              )}

                              <span className="truncate max-w-[150px] md:max-w-xs">{m.file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 pr-2">
                              <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />
                              <span className="text-xs text-brand-orange font-medium">Feltöltés...</span>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
				
                {/* PDF csatolmányok Listája */}
                {attachmentFields.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-white/5 mt-4">
                    <h4 className="text-sm font-medium text-white/70">Feltöltött Csatolmányok (PDF)</h4>
                    <div className="flex flex-col gap-2">
                      {attachmentFields.map((field, i) => (
                        <div key={field.id} className={styles.mediaRow}>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-xs py-1 px-2 bg-white/10 rounded text-white/80">PDF</span>
                            <span className="truncate max-w-[200px] font-medium text-white/80">{field.name}</span>
                          </div>
                          <Button type="button" className={`${styles.iconDeleteBtn}`} onClick={() => removeAttachment(i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Termékcsalád (Product Family) */}
            {products.length > 0 && (
              <FormField
                control={form.control}
                name="familyProductIds"
                render={() => (
                  <FormItem>
                    <div className={styles.sectionHeader}>
                      <FormLabel className={styles.sectionTitle}>Termékcsalád tagjai</FormLabel>
                      <div className="relative max-w-xs w-[250px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                        <Input 
                          placeholder="Termék keresése..." 
                          className={`pr-10 ${styles.inputWrapper} ${styles.input}`} 
                          value={familySearch}
                          onChange={(e) => setFamilySearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-admin-bg p-4 rounded-xl max-h-[300px] overflow-y-auto">
                      {products
                        .filter(p => p.id !== productId && (p.name?.hu?.toLowerCase().includes(familySearch.toLowerCase()) || p.name?.en?.toLowerCase().includes(familySearch.toLowerCase())))
                        .map((product) => (
                        <FormField
                          key={product.id}
                          control={form.control}
                          name="familyProductIds"
                          render={({ field }) => {
                            return (
                              <FormItem key={product.id}>
                                <FormLabel className={`${styles.checkboxItem} w-full m-0`}>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(product.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), product.id])
                                          : field.onChange((field.value?.filter((value: string) => value !== product.id)) || [])
                                      }}
                                      className={styles.checkbox}
                                    />
                                  </FormControl>
                                  <span className="font-normal cursor-pointer line-clamp-2 text-white/80">
                                    {product.name?.hu || "Termék"}
                                  </span>
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-white/40 mt-2 italic px-2">
                       A kiválasztott termékek egy közös csoportba (variációba) kerülnek.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Ajánlott Termékek */}
            {products.length > 0 && (
              <FormField
                control={form.control}
                name="recommendations"
                render={() => (
                  <FormItem>
                    <div className={styles.sectionHeader}>
                      <FormLabel className={styles.sectionTitle}>Ajánlott termékek</FormLabel>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-admin-bg p-4 rounded-xl max-h-[300px] overflow-y-auto">
                      {products
                        .filter(p => p.id !== productId)
                        .map((product) => (
                        <FormField
                          key={product.id}
                          control={form.control}
                          name="recommendations"
                          render={({ field }) => {
                            return (
                              <FormItem key={product.id}>
                                <FormLabel className={`${styles.checkboxItem} w-full m-0`}>
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(product.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), product.id])
                                          : field.onChange((field.value?.filter((value: string) => value !== product.id)) || [])
                                      }}
                                      className={styles.checkbox}
                                    />
                                  </FormControl>
                                  <span className="font-normal cursor-pointer line-clamp-2 text-white/80">
                                    {product.name?.hu || "Termék"}
                                  </span>
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

          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
