"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { upsertCategory } from "@/modules/shop/actions";
import { generateCategorySlug } from "@/lib/utils";
import { categoryFormSchema, CategoryFormValues } from "@/modules/shop/schemas";

interface CategoryDoc {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string> | null;
  slug: string;
  parentId?: string | null;
}

interface CategoryFormProps {
  initialData?: CategoryDoc | null;
  categories: { id: string; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ initialData, categories, onSuccess, onCancel }: CategoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  const defaultValues: Partial<CategoryFormValues> = {
    id: initialData?.id || undefined,
    name_hu: initialData?.name?.hu || "",
    name_en: initialData?.name?.en || "",
    name_sk: initialData?.name?.sk || "",
    description_hu: initialData?.description?.hu || "",
    description_en: initialData?.description?.en || "",
    description_sk: initialData?.description?.sk || "",
    slug: initialData?.slug || "",
    parentId: initialData?.parentId || "none",
  };

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  // Figyeljük a magyar nevet, és automatikusan generáljuk a slug-ot, ha le van zárva
  const nameHu = form.watch("name_hu");
  useEffect(() => {
    if (isSlugLocked && nameHu) {
      // Csak generálunk, ha újat hozunk létre vagy engedélyezték (viszont ha locked, és szerkesztünk, a meglévő is módosul, ha átírja a nevét)
      form.setValue("slug", generateCategorySlug(nameHu), { shouldValidate: true });
    }
  }, [nameHu, isSlugLocked, form]);

  const onSubmit = (data: CategoryFormValues) => {
    startTransition(async () => {
      // Átalakítjuk a szerver által várt sémára
      const payload = {
        id: data.id,
        name: {
          hu: data.name_hu,
          en: data.name_en || "",
          sk: data.name_sk || "",
        },
        description: {
          hu: data.description_hu || "",
          en: data.description_en || "",
          sk: data.description_sk || "",
        },
        slug: data.slug,
        parentId: (data.parentId === "none" || data.parentId === "") ? null : data.parentId,
      };

      const result = await upsertCategory(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(initialData ? "Kategória frissítve!" : "Kategória létrehozva!");
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Név Tabs */}
        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-white">Megnevezés és leírás</h3>
          </div>
          <Tabs defaultValue="hu" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/5 rounded-lg mb-4">
              <TabsTrigger value="hu">Magyar (HU)</TabsTrigger>
              <TabsTrigger value="en">English (EN)</TabsTrigger>
              <TabsTrigger value="sk">Slovenský (SK)</TabsTrigger>
            </TabsList>
            
            {/* HU Tab */}
            <TabsContent value="hu" className="space-y-4 mt-0">
              <FormField
                control={form.control}
                name="name_hu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Kategória neve (HU) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Pl: Hangtálak" {...field} className="bg-black/50 border-white/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_hu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Leírás (HU)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Kategória rövid leírása..." {...field} className="bg-black/50 border-white/10 text-white min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* EN Tab */}
            <TabsContent value="en" className="space-y-4 mt-0">
              <FormField
                control={form.control}
                name="name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Kategória neve (EN)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g: Singing Bowls" {...field} className="bg-black/50 border-white/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Leírás (EN)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short description..." {...field} className="bg-black/50 border-white/10 text-white min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>

            {/* SK Tab */}
            <TabsContent value="sk" className="space-y-4 mt-0">
              <FormField
                control={form.control}
                name="name_sk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Kategória neve (SK)</FormLabel>
                    <FormControl>
                      <Input placeholder="Napr: Spievajúce misy" {...field} className="bg-black/50 border-white/10 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description_sk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Leírás (SK)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Krátky opis..." {...field} className="bg-black/50 border-white/10 text-white min-h-[100px]" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex flex-col gap-6 bg-white/5 p-4 rounded-xl border border-white/10">
          {/* Slug (URL) */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-white/70">URL részlet (Slug) *</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-white/50 hover:text-white"
                    onClick={() => setIsSlugLocked(!isSlugLocked)}
                  >
                    {isSlugLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                    {isSlugLocked ? "Feloldás" : "Zárolás"}
                  </Button>
                </div>
                <FormControl>
                  <Input 
                    {...field} 
                    disabled={isSlugLocked}
                    className="bg-black/50 border-white/10 text-white disabled:opacity-50" 
                    placeholder="pl-uj-kategoria"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Szülő Kategória */}
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white/70">Szülő Kategória</FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger className="bg-black/50 border-white/10 text-white">
                      <SelectValue placeholder="Nincs (Főkategória)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-neutral-900 border-white/10 text-white">
                    <SelectItem value="none">-- Főkategória --</SelectItem>
                    {categories.filter(c => c.id !== initialData?.id).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="bg-transparent border-white/10 hover:bg-white/5 text-white"
            >
              Mégse
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mentés folyamatban...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {initialData ? "Módosítások mentése" : "Kategória létrehozása"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
