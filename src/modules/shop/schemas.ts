import { z } from "zod";
import { productTypeEnum } from "@/db/schema/shop";

// --- 1. Alap Típusok és DB Formátumok ---

// Megfelel a DB jsonb struktúrájának: { hu: string, en: string, sk: string }
export const i18nStringSchema = z.object({
  hu: z.string().min(1, "A magyar fordítás kötelező!"),
  en: z.string().optional().default(""),
  sk: z.string().optional().default(""),
});

// --- 2. Kliens Oldali Úrlap Séma (React Hook Form) ---

// Biztonságos Input-Szám transzformátor react-hook-form string kimenethez
const rhfNumberField = z.union([z.string(), z.number()]).transform((val) => {
  if (val === "") return 0;
  return Number(val);
}).refine(val => !isNaN(val), { message: "Érvényes számot adj meg!" });

// Ez a séma írja le az űrlap állapotát, minden mezőt tartalmaz, még a rejtetteket is
export const productFormSchema = z.object({
  type: z.enum(productTypeEnum.enumValues).default("physical"),
  
  // Név és Leírás nyelvek (lapos struktúrában az űrlap kezeléséhez)
  name_hu: z.string().min(2, "A megnevezés kötelező!"),
  name_en: z.string().optional(),
  name_sk: z.string().optional(),
  
  description_hu: z.string().optional(),
  description_en: z.string().optional(),
  description_sk: z.string().optional(),
  
  // Árazás
  priceHuf: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  priceEur: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  
  // Variáns alap (MuFis)
  sku: z.string().optional(),
  
  // Logisztika (Fizikai termékhez)
  weight: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  width: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  height: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  depth: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  
  // Média
  media: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(["IMAGE", "YOUTUBE", "AUDIO"]),
  })).optional().default([]),

}).superRefine((data, ctx) => {
  // Feltételes validáció fizikai termékeknél
  if (data.type === "physical") {
    if (!data.sku || data.sku.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fizikai terméknél az SKU kötelező (min 3 karakter)!",
        path: ["sku"],
      });
    }
    if (!data.weight || data.weight <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fizikai terméknél a súly megadása kötelező!",
        path: ["weight"],
      });
    }
  }
});

// A form hook által elvárt típusok
export type ProductFormValues = z.infer<typeof productFormSchema>;

// --- 3. Szerver Oldali (Action) Payload Séma ---
// Ezt fogja a böngésző a szerver felé küldeni, már strukturált formában
export const createProductServerSchema = z.object({
  type: z.enum(productTypeEnum.enumValues),
  name: i18nStringSchema,
  description: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }),
  sku: z.string().optional(),
  priceHuf: z.number().min(0),
  priceEur: z.number().min(0),
  weight: z.number().optional().default(0),
  width: z.number().optional().default(0),
  height: z.number().optional().default(0),
  depth: z.number().optional().default(0),
  media: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(["IMAGE", "YOUTUBE", "AUDIO"]),
  })).optional().default([]),
  // Kategória azonosítók listája (opcionális)
  categoryIds: z.array(z.string().uuid()).optional().default([]),
}).superRefine((data, ctx) => {
  // Szerveroldali biztonsági validáció
  if (data.type === "physical") {
    if (!data.sku || data.sku.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fizikai terméknél az SKU kötelező!",
        path: ["sku"],
      });
    }
    if (data.weight === undefined || data.weight <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fizikai terméknél a súly kötelező!",
        path: ["weight"],
      });
    }
  }
});

export type CreateProductPayload = z.infer<typeof createProductServerSchema>;
