"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createProduct } from "../actions";
import { productFormSchema } from "../schemas";

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function useProductForm() {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProductFormValues>({
    // Ts-ignore a React Hook Form és Zod types inkompatibilitás miatt transzformációknál
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: {
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
      sku: "",
      priceHuf: 0,
      priceEur: 0,
      weight: 0,
      width: 0,
      height: 0,
      depth: 0,
      media: [],
      status: "ACTIVE",
      priority: 0,
      layoutTemplate: "STANDARD",
      categoryIds: [],
    },
  });

  const productType = form.watch("type");

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
      sku: values.sku,
      priceHuf: values.priceHuf,
      priceEur: values.priceEur,
      weight: values.weight,
      width: values.width,
      height: values.height,
      depth: values.depth,
      media: values.media,
      status: values.status,
      priority: values.priority,
      layoutTemplate: values.layoutTemplate,
      categoryIds: values.categoryIds || [],
    };

    const result = await createProduct(payload);
    setIsPending(false);

    if (result.success) {
      toast.success("Termék sikeresen létrehozva!");
      form.reset();
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
