import * as z from "zod";

export const registerSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(6, "A jelszónak legalább 6 karakternek kell lennie!"),
  name: z.string().min(2, "A név megadása kötelező!"),
});

export const loginSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(1, "Kérlek, írd be a jelszavadat!"),
  name: z.string().optional(),
});

export const registerUserNewSchema = z.object({
  // Step 1: Basic
  email: z.string().email("Érvénytelen e-mail cím!"),
  password: z.string().min(8, "A jelszónak legalább 8 karakternek kell lennie!"),
  passwordConfirm: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, "Az ÁSZF elfogadása kötelező!"),
  privacyAccepted: z.boolean().refine(val => val === true, "Az Adatkezelési Tájékoztató elfogadása kötelező!"),
  
  // Step 2: Personal (Optional)
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),

  // Step 3: Student (Optional)
  expertise: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "A jelszavak nem egyeznek!",
  path: ["passwordConfirm"],
});

export const userAdminUpdateSchema = z.object({
  role: z.enum(["admin", "user"]),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  lang: z.string().min(2).max(10).default("hu"),
  expertise: z.string().optional().nullable(),
  interests: z.string().optional().nullable(),
  
  // Számlázási cím
  billing_country: z.string().optional().nullable(),
  billing_zip: z.string().optional().nullable(),
  billing_city: z.string().optional().nullable(),
  billing_street: z.string().optional().nullable(),
  billing_companyName: z.string().optional().nullable(),
  billing_taxNumber: z.string().optional().nullable(),
  
  // Szállítási cím
  shipping_country: z.string().optional().nullable(),
  shipping_zip: z.string().optional().nullable(),
  shipping_city: z.string().optional().nullable(),
  shipping_street: z.string().optional().nullable(),
});

export const userProfileUpdateSchema = userAdminUpdateSchema.omit({ role: true });
