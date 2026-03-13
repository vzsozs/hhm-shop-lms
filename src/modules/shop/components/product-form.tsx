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
import { Loader2, Plus, Trash2, ChevronUp, ChevronDown, Image as ImageIcon, Music, FileText, Users, UserPlus, Package } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { productFormStyles as styles } from "./product-form.styles";
import { getBadgeIcons } from "../actions";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("../../admin/components/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-card-bg border border-white/10 rounded-xl animate-pulse" />
});

interface PendingUpload {
  file: File;
  localUrl: string;
  type: "IMAGE" | "AUDIO" | "DOCUMENT";
}

export function ProductForm({ categories = [], products = [], productGroups = [], initialData, productId }: {
  categories?: { id: string; name: Record<string, string> }[];
  products?: { id: string; name: Record<string, string> }[];
  productGroups?: { id: string; name: Record<string, string>; slug?: Record<string, string> }[];
  initialData?: Partial<ProductFormValues>;
  productId?: string;
}) {
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
  const [availableBadges, setAvailableBadges] = useState<string[]>([]);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // Cleanup memory on unmount for object URLs
  useEffect(() => {
    const activeUrls = objectUrlsRef.current;
    return () => {
      activeUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      const badges = await getBadgeIcons();
      setAvailableBadges(badges);
    };
    fetchBadges();
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
            <CardTitle className={`${styles.cardTitle} flex items-center gap-3`}>
              <Package className="text-brand-orange" size={24} />
              {isEditMode ? "Termék szerkesztése" : "Új termék hozzáadása"}
            </CardTitle>
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
                          <RichTextEditor 
                            value={field.value as string || ""} 
                            onChange={field.onChange} 
                            placeholder={`Részletes termékleírás ${lang}-ul...`}
                          />
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

            {/* Termékcsalád (Product Family) – Named Groups */}
            <div>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Termékcsalád</h3>
              </div>
              <div className={`${styles.sectionContent} space-y-4`}>
                <FormField
                  control={form.control}
                  name="groupMode"
                  render={({ field }) => (
                    <FormItem>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (val !== "new_group") form.setValue("newGroupName", { hu: "", en: "", sk: "" });
                          if (val !== "join_group") form.setValue("selectedGroupId", undefined);
                        }}
                        className="flex flex-col gap-3"
                      >
                        {/* Option A: Önálló */}
                        <div className="flex items-start gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition-colors">
                          <RadioGroupItem value="standalone" id="grp-standalone" className="mt-0.5 border-white/30 text-brand-orange" />
                          <div>
                            <Label htmlFor="grp-standalone" className="font-semibold text-white cursor-pointer flex items-center gap-2">
                              <Package className="h-4 w-4 text-white/60" />
                              Önálló termék
                            </Label>
                            <p className="text-xs text-white/40 mt-0.5">Nem tartozik semmilyen csoporthoz.</p>
                          </div>
                        </div>

                        {/* Option B: Új nevesített csoport */}
                        <div className="flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition-colors">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="new_group" id="grp-new" className="mt-0.5 border-white/30 text-brand-orange" />
                            <div>
                              <Label htmlFor="grp-new" className="font-semibold text-white cursor-pointer flex items-center gap-2">
                                <UserPlus className="h-4 w-4 text-white/60" />
                                Új termékcsalád létrehozása
                              </Label>
                              <p className="text-xs text-white/40 mt-0.5">Adj nevet az új csoportnak – ez lesz a admin felületen látható cím.</p>
                            </div>
                          </div>

                          {/* Név mezők – csak new_group módban */}
                          {field.value === "new_group" && (
                            <div className="ml-7 space-y-2">
                              <FormField control={form.control} name="newGroupName.hu" render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel className={styles.label}>Csoport neve (HU) *</FormLabel>
                                  <FormControl><Input placeholder="pl. Meinl Sonic Energy sorozat" className={`${styles.inputWrapper} ${styles.input}`} {...f} value={f.value as string || ""} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <div className="grid grid-cols-2 gap-2">
                                <FormField control={form.control} name="newGroupName.en" render={({ field: f }) => (
                                  <FormItem>
                                    <FormLabel className={styles.label}>Csoport neve (EN)</FormLabel>
                                    <FormControl><Input placeholder="eg. Meinl Sonic Energy series" className={`${styles.inputWrapper} ${styles.input}`} {...f} value={f.value as string || ""} /></FormControl>
                                  </FormItem>
                                )} />
                                <FormField control={form.control} name="newGroupName.sk" render={({ field: f }) => (
                                  <FormItem>
                                    <FormLabel className={styles.label}>Csoport neve (SK)</FormLabel>
                                    <FormControl><Input placeholder="napr. Meinl Sonic Energy séria" className={`${styles.inputWrapper} ${styles.input}`} {...f} value={f.value as string || ""} /></FormControl>
                                  </FormItem>
                                )} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Option C: Meglévő csoporthoz csatlakozás */}
                        <div className="flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/[0.08] transition-colors">
                          <div className="flex items-start gap-3">
                            <RadioGroupItem value="join_group" id="grp-join" className="mt-0.5 border-white/30 text-brand-orange" />
                            <div>
                              <Label htmlFor="grp-join" className="font-semibold text-white cursor-pointer flex items-center gap-2">
                                <Users className="h-4 w-4 text-white/60" />
                                Csatlakozás meglévő termékcsaládhoz
                              </Label>
                              <p className="text-xs text-white/40 mt-0.5">Válassz egy meglévő, nevesített csoportot a legördülőből.</p>
                            </div>
                          </div>

                          {/* Csoport-választó – csak join_group módban */}
                          {field.value === "join_group" && (
                            <div className="ml-7">
                              <FormField
                                control={form.control}
                                name="selectedGroupId"
                                render={({ field: gField }) => (
                                  <FormItem>
                                    <FormLabel className={styles.label}>Termékcsalád kiválasztása</FormLabel>
                                    <Select
                                      onValueChange={gField.onChange}
                                      value={gField.value || ""}
                                    >
                                      <FormControl>
                                        <SelectTrigger className={`${styles.inputWrapper} h-11`}>
                                          <SelectValue placeholder="Válassz termékcsaládot..." />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="bg-admin-bg border-white/10 text-white max-h-[200px]">
                                        {productGroups.length === 0 ? (
                                          <div className="px-3 py-4 text-sm text-white/40 italic">Még nincs nevesített termékcsalád.</div>
                                        ) : (
                                          productGroups.map(g => (
                                            <SelectItem key={g.id} value={g.id} className="cursor-pointer">
                                              {g.name?.hu || g.name?.en || "Névtelen csoport"}
                                            </SelectItem>
                                          ))
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Termék Badge-ek */}
            <div className="mt-8 mb-4">
              <FormField
                control={form.control}
                name="badges"
                render={({ field }) => (
                  <FormItem>
                    <div className={styles.sectionHeader}>
                      <FormLabel className={styles.sectionTitle}>Termék Badge-ek (Maximum 3 db)</FormLabel>
                    </div>
                    
                    {availableBadges.length > 0 ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 bg-admin-bg p-4 rounded-xl">
                          {availableBadges.map((badgeIcon) => {
                            const selectedIndex = field.value?.findIndex(b => b.icon === badgeIcon);
                            const isSelected = selectedIndex !== -1;
                            
                            return (
                              <div 
                                key={badgeIcon}
                                onClick={() => {
                                  let newValue = [...(field.value || [])];
                                  if (isSelected) {
                                    newValue = newValue.filter(b => b.icon !== badgeIcon);
                                  } else {
                                    if (newValue.length < 3) {
                                      newValue.push({ 
                                        icon: badgeIcon 
                                      });
                                    } else {
                                      return;
                                    }
                                  }
                                  field.onChange(newValue);
                                }}
                                className={`relative aspect-square rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                                  isSelected 
                                    ? "border-brand-orange bg-brand-orange/10 shadow-[0_0_10px_rgba(255,107,0,0.2)]" 
                                    : "border-white/5 bg-white/5 hover:border-white/20"
                                }`}
                                title={badgeIcon}
                              >
                                <div className="relative w-8 h-8">
                                  <Image
                                    src={`/assets/badges/${badgeIcon}`}
                                    alt={badgeIcon}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 bg-brand-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-lg">
                                    {(selectedIndex as number) + 1}
                                  </div>
                                )}
                                <div className="absolute -bottom-5 left-0 right-0 overflow-hidden text-center">
                                  <span className="text-[10px] text-white/40 truncate block px-1">
                                    {badgeIcon}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-admin-bg p-6 rounded-xl border border-dashed border-white/10 text-center">
                        <p className="text-sm text-white/40">Nincsenek elérhető badge-ek a `public/assets/badges` mappában.</p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
