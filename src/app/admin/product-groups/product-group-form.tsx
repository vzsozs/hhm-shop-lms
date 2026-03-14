"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { updateProductGroup } from "@/modules/shop/actions";
import { productGroupFormSchema, ProductGroupFormValues } from "@/modules/shop/schemas";

interface ProductGroupDoc {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
}

interface ProductGroupFormProps {
  initialData: ProductGroupDoc;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductGroupForm({ initialData, onSuccess, onCancel }: ProductGroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isSlugLocked, setIsSlugLocked] = useState(true);

  const defaultValues: ProductGroupFormValues = {
    id: initialData.id,
    name_hu: initialData.name.hu || "",
    name_en: initialData.name.en || "",
    name_sk: initialData.name.sk || "",
    slug_hu: initialData.slug.hu || "",
    slug_en: initialData.slug.en || "",
    slug_sk: initialData.slug.sk || "",
  };

  const form = useForm<ProductGroupFormValues>({
    resolver: zodResolver(productGroupFormSchema),
    defaultValues,
  });

  // Slug generator (simple version for product groups)
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Watch names and update slugs if locked
  const nameHu = useWatch({ control: form.control, name: "name_hu" });
  const nameEn = useWatch({ control: form.control, name: "name_en" });
  const nameSk = useWatch({ control: form.control, name: "name_sk" });

  useEffect(() => {
    if (isSlugLocked) {
      if (nameHu) form.setValue("slug_hu", generateSlug(nameHu), { shouldValidate: true });
      if (nameEn) form.setValue("slug_en", generateSlug(nameEn), { shouldValidate: true });
      if (nameSk) form.setValue("slug_sk", generateSlug(nameSk), { shouldValidate: true });
    }
  }, [nameHu, nameEn, nameSk, isSlugLocked, form]);

  const onSubmit = (data: ProductGroupFormValues) => {
    startTransition(async () => {
      const payload = {
        id: data.id,
        name: {
          hu: data.name_hu,
          en: data.name_en || "",
          sk: data.name_sk || "",
        },
        slug: {
          hu: data.slug_hu,
          en: data.slug_en || "",
          sk: data.slug_sk || "",
        },
      };

      const result = await updateProductGroup(payload);

      if (result.success) {
        toast.success("Termékcsalád frissítve!");
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.error || "Hiba történt a mentés során.");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="flex justify-end mb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-white/50 hover:text-white"
              onClick={() => setIsSlugLocked(!isSlugLocked)}
            >
              {isSlugLocked ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
              {isSlugLocked ? "Slugok zárolva" : "Slugok feloldva"}
            </Button>
        </div>

        <Tabs defaultValue="hu" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/40 border border-white/5 rounded-lg mb-4">
            <TabsTrigger value="hu" className="text-white/60 data-[state=active]:text-black">Magyar (HU)</TabsTrigger>
            <TabsTrigger value="en" className="text-white/60 data-[state=active]:text-black">English (EN)</TabsTrigger>
            <TabsTrigger value="sk" className="text-white/60 data-[state=active]:text-black">Slovenský (SK)</TabsTrigger>
          </TabsList>
          
          {/* HU Tab */}
          <TabsContent value="hu" className="space-y-4 mt-0">
            <FormField
              control={form.control}
              name="name_hu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Név (HU) *</FormLabel>
                  <FormControl>
                    <Input placeholder="Pl: Meinl Sonic Energy" {...field} className="bg-black/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug_hu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Slug (HU) *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSlugLocked} className="bg-black/50 border-white/10 text-white disabled:opacity-50" />
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
                  <FormLabel className="text-white/70">Name (EN)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g: Meinl Sonic Energy" {...field} className="bg-black/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Slug (EN)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSlugLocked} className="bg-black/50 border-white/10 text-white disabled:opacity-50" />
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
                  <FormLabel className="text-white/70">Názov (SK)</FormLabel>
                  <FormControl>
                    <Input placeholder="Napr: Meinl Sonic Energy" {...field} className="bg-black/50 border-white/10 text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug_sk"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70">Slug (SK)</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSlugLocked} className="bg-black/50 border-white/10 text-white disabled:opacity-50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

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
            className="bg-brand-orange hover:bg-brand-orange/90 text-white min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mentés...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Mentés
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
