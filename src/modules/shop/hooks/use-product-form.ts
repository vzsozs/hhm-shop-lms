"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createProduct, updateProduct } from "../actions";
import { productFormSchema } from "../schemas";

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function useProductForm(initialData?: Partial<ProductFormValues>, productId?: string) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProductFormValues>({
    // Ts-ignore a React Hook Form és Zod types inkompatibilitás miatt transzformációknál
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialData || {
      type: "physical",
      name_hu: "",
      name_en: "",
      description_hu: "",
      description_en: "",
      description_sk: "",
      shortDescription_hu: "",
      shortDescription_en: "",
      shortDescription_sk: "",
      longDescription_hu: "",
      longDescription_en: "",
      longDescription_sk: "",
      variants: [{
        name_hu: "",
        name_en: "",
        name_sk: "",
        sku: "",
        priceHuf: 0,
        priceEur: 0,
        stock: 0,
        weight: 0,
        width: 0,
        height: 0,
        depth: 0,
      }],
      specifications: [],
      recommendations: [],
      attachments: [],
      media: [],
      status: "ACTIVE",
      priority: 0,
      layoutTemplate: "STANDARD",
      categoryIds: [],
      groupMode: "standalone" as const,
      selectedGroupId: undefined,
      newGroupName: { hu: "", en: "", sk: "" },
      badges: [],
    },
  });

  const productType = useWatch({ control: form.control, name: "type" });

  async function onSubmit(values: ProductFormValues) {
    setIsPending(true);
    
    // Transzformáció a szerver action által várt formátumra
    const payload = {
      type: values.type,
      name: {
        hu: values.name_hu,
        en: values.name_en || "",
        sk: values.name_sk || "",
      },
      description: {
        hu: values.description_hu || "",
        en: values.description_en || "",
        sk: values.description_sk || "",
      },
      shortDescription: {
        hu: values.shortDescription_hu || "",
        en: values.shortDescription_en || "",
        sk: values.shortDescription_sk || "",
      },
      longDescription: {
        hu: values.longDescription_hu || "",
        en: values.longDescription_en || "",
        sk: values.longDescription_sk || "",
      },
      variants: values.variants.map(v => ({
        id: v.id,
        name: {
          hu: v.name_hu || "",
          en: v.name_en || "",
          sk: v.name_sk || "",
        },
        sku: v.sku,
        priceHuf: v.priceHuf,
        priceEur: v.priceEur,
        stock: v.stock,
        weight: v.weight,
        width: v.width,
        height: v.height,
        depth: v.depth,
      })),
      specifications: values.specifications.map(s => ({
        key_hu: s.key_hu, value_hu: s.value_hu,
        key_en: s.key_en || "", value_en: s.value_en || "",
        key_sk: s.key_sk || "", value_sk: s.value_sk || "",
      })),
      recommendations: values.recommendations,
      attachments: values.attachments,
      media: values.media,
      status: values.status,
      priority: values.priority,
      layoutTemplate: values.layoutTemplate,
      categoryIds: values.categoryIds || [],
      selectedGroupId: values.groupMode === "join_group" ? values.selectedGroupId : undefined,
      newGroupName: values.groupMode === "new_group" ? values.newGroupName : undefined,
      badges: values.badges.map(b => ({
        icon: b.icon,
      })),
    };

    const result = productId 
      ? await updateProduct(productId, payload)
      : await createProduct(payload);
    setIsPending(false);

    if (result.success) {
      toast.success(productId ? "Termék sikeresen frissítve!" : "Termék sikeresen létrehozva!");
      if (!productId) {
        form.reset();
      }
    } else {
      toast.error(result.error || "Hiba történt a mentés során.");
    }
  }

  const moveMedia = (index: number, direction: 'UP' | 'DOWN') => {
    const currentMedia = [...(form.getValues("media") || [])];
    if (direction === 'UP' && index > 0) {
      const temp = currentMedia[index - 1];
      currentMedia[index - 1] = currentMedia[index];
      currentMedia[index] = temp;
      form.setValue("media", currentMedia, { shouldDirty: true });
    } else if (direction === 'DOWN' && index < currentMedia.length - 1) {
      const temp = currentMedia[index + 1];
      currentMedia[index + 1] = currentMedia[index];
      currentMedia[index] = temp;
      form.setValue("media", currentMedia, { shouldDirty: true });
    }
  };

  const removeMedia = (index: number) => {
    const currentMedia = form.getValues("media") || [];
    currentMedia.splice(index, 1);
    form.setValue("media", [...currentMedia], { shouldDirty: true });
  };

  return { form, isPending, onSubmit, productType, moveMedia, removeMedia };
}
