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
      name_sk: "",
      description_hu: "",
      description_en: "",
      description_sk: "",
      sku: "",
      priceHuf: 0,
      priceEur: 0,
      weight: 0,
      width: 0,
      height: 0,
      depth: 0,
      media: [],
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
      sku: values.sku,
      priceHuf: values.priceHuf,
      priceEur: values.priceEur,
      weight: values.weight,
      width: values.width,
      height: values.height,
      depth: values.depth,
      media: values.media,
      categoryIds: [], // Az admin form jelenlegi verziója nem kezeli, alapértelmezetten üres
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

  return { form, isPending, onSubmit, productType };
}
