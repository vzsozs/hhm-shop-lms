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
  
  // A régi leírás (megmaradhat visszafelé kompatibilitás miatt, de opcionális)
  description_hu: z.string().optional(),
  description_en: z.string().optional(),
  description_sk: z.string().optional(),
  
  // Új Leírások (Rövid és Hosszú - egyelőre legalább a magyart kezelve az UI-ban)
  shortDescription_hu: z.string().optional(),
  shortDescription_en: z.string().optional(),
  shortDescription_sk: z.string().optional(),

  longDescription_hu: z.string().optional(),
  longDescription_en: z.string().optional(),
  longDescription_sk: z.string().optional(),
  
  // Variációk és Logisztika
  variants: z.array(z.object({
    id: z.string().optional(),
    name_hu: z.string().optional(),
    name_en: z.string().optional(),
    name_sk: z.string().optional(),
    sku: z.string().min(1, "Az SKU kötelező"),
    priceHuf: rhfNumberField.refine(v => v > 0, { message: "Az árnak nagyobbnak kell lennie 0-nál!" }),
    priceEur: rhfNumberField.refine(v => v > 0, { message: "Az árnak nagyobbnak kell lennie 0-nál!" }),
    stock: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
    weight: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
    width: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
    height: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
    depth: rhfNumberField.refine(v => v >= 0, { message: "Nem lehet negatív!" }),
  })).min(1, "Legalább egy variáció kötelező!").default([]),

  // Dinamikus Specifikációk
  specifications: z.array(z.object({
    key_hu: z.string().min(1, "Kulcs (HU) kötelező"),
    value_hu: z.string().min(1, "Érték (HU) kötelező"),
    key_en: z.string().optional().default(""),
    value_en: z.string().optional().default(""),
    key_sk: z.string().optional().default(""),
    value_sk: z.string().optional().default(""),
  })).optional().default([]),

  // Ajánlott termékek azonosítói
  recommendations: z.array(z.string().uuid()).optional().default([]),

  // Csatolt dokumentumok
  attachments: z.array(z.object({
    url: z.string().min(1, "URL kötelező"),
    name: z.string().min(1, "Fájlnév kötelező"),
  })).optional().default([]),
  
  // Média
  media: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(["IMAGE", "YOUTUBE", "AUDIO"]),
  })).optional().default([]),

  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  priority: rhfNumberField.optional().default(0),
  layoutTemplate: z.enum(["STANDARD", "VIDEO_CENTERED", "DOCUMENTARY"]).default("STANDARD"),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  // 3-utas termékcsalád mód
  groupMode: z.enum(["standalone", "new_group", "join_group"]).default("standalone"),
  // join_group módban: a kiválasztott csoport UUID-ja
  selectedGroupId: z.string().uuid().optional(),
  // new_group módban: az új csoport neve (többnyelvű) – feltételes validáció
  newGroupName: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }).optional(),
}).superRefine((data, ctx) => {
  // Feltételes validáció: new_group módban a csoport neve kötelező
  if (data.groupMode === "new_group") {
    const hu = data.newGroupName?.hu || "";
    if (hu.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Az új termékcsalád neve kötelező (min. 2 karakter)!",
        path: ["newGroupName", "hu"],
      });
    }
  }
  // join_group módban a csoport UUID kötelező
  if (data.groupMode === "join_group" && !data.selectedGroupId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Válassz ki egy meglévő termékcsaládot!",
      path: ["selectedGroupId"],
    });
  }
  // Feltételes validáció fizikai termékeknél a variánsokon
  if (data.type === "physical") {
    data.variants.forEach((variant, index) => {
      if (!variant.weight || variant.weight <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fizikai terméknél a súly megadása kötelező!",
          path: ["variants", index, "weight"],
        });
      }
    });
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
  shortDescription: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }),
  longDescription: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }),
  variants: z.array(z.object({
    id: z.string().optional(),
    name: z.object({
      hu: z.string().optional().default(""),
      en: z.string().optional().default(""),
      sk: z.string().optional().default(""),
    }),
    sku: z.string(),
    priceHuf: z.number().positive(),
    priceEur: z.number().positive(),
    stock: z.number().min(0),
    weight: z.number().optional().default(0),
    width: z.number().optional().default(0),
    height: z.number().optional().default(0),
    depth: z.number().optional().default(0),
  })).min(1),
  specifications: z.array(z.object({
    key_hu: z.string(),
    value_hu: z.string(),
    key_en: z.string().optional().default(""),
    value_en: z.string().optional().default(""),
    key_sk: z.string().optional().default(""),
    value_sk: z.string().optional().default(""),
  })).optional().default([]),
  recommendations: z.array(z.string().uuid()).optional().default([]),
  attachments: z.array(z.object({
    url: z.string(),
    name: z.string(),
  })).optional().default([]),
  media: z.array(z.object({
    url: z.string().min(1),
    type: z.enum(["IMAGE", "YOUTUBE", "AUDIO"]),
  })).optional().default([]),
  // Kategória azonosítók listája (opcionális)
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  // Named Group kezelés: join_group módban meglévő csoport ID-ja
  selectedGroupId: z.string().uuid().optional(),
  // Named Group kezelés: new_group módban új csoport neve
  newGroupName: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }).optional(),
  
  slug: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }).optional(),
  
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  priority: z.number().optional().default(0),
  layoutTemplate: z.enum(["STANDARD", "VIDEO_CENTERED", "DOCUMENTARY"]).default("STANDARD"),
}).superRefine((data, ctx) => {
  // Szerveroldali biztonsági validáció fizikai termékeknél
  if (data.type === "physical") {
    data.variants.forEach((variant, index) => {
      if (variant.weight === undefined || variant.weight <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fizikai terméknél a súly kötelező!",
          path: ["variants", index, "weight"],
        });
      }
    });
  }
});

export type CreateProductPayload = z.infer<typeof createProductServerSchema>;

// --- 4. Kategória Séma (Új) ---
export const categoryFormSchema = z.object({
  id: z.string().optional(),
  name_hu: z.string().min(2, "A kategória neve kötelező!"),
  name_en: z.string().optional(),
  name_sk: z.string().optional(),
  description_hu: z.string().optional(),
  description_en: z.string().optional(),
  description_sk: z.string().optional(),
  slug: z.string().min(2, "A slug kötelező!"),
  parentId: z.string().uuid("Érvénytelen szülő kategória").optional().nullable().or(z.literal("")).or(z.literal("none")),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const categoryServerSchema = z.object({
  id: z.string().optional(),
  name: i18nStringSchema,
  description: z.object({
    hu: z.string().optional().default(""),
    en: z.string().optional().default(""),
    sk: z.string().optional().default(""),
  }),
  slug: z.union([z.string(), i18nStringSchema]).transform(val => typeof val === 'string' ? { hu: val, en: "", sk: "" } : val),
  parentId: z.string().uuid().optional().nullable().or(z.literal("")).or(z.literal("none")).transform(val => (val === "" || val === "none") ? null : val),
});
export type CategoryServerPayload = z.infer<typeof categoryServerSchema>;
