"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, profiles } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(6, "A jelszónak legalább 6 karakternek kell lennie!"),
  name: z.string().min(2, "A név megadása kötelező!"),
});

const loginSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(1, "Kérlek, írd be a jelszavadat!"),
  name: z.string().optional(),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Hibásan kitöltött mezők!" };
    }

    const { email, password, name } = validatedFields.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "Ez az e-mail cím már foglalt!" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Tranzakció: User és Profile létrehozása együtt
    await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({
        email,
        passwordHash,
        name,
        role: "user",
      }).returning();

      await tx.insert(profiles).values({
        userId: newUser.id,
        name: name,
        lang: "hu",
      });
    });

    return { success: "Sikeres regisztráció! Kérlek lépj be." };
  } catch (error) {
    console.error("Hiba a regisztráció során:", error);
    return { error: "Váratlan hiba történt a regisztráció során." };
  }
}

export async function loginUser(values: z.infer<typeof loginSchema>) {
  try {
    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    
    return { success: "Sikeres bejelentkezés!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Hibás e-mail cím vagy jelszó!" };
        default:
          return { error: "Váratlan hiba a bejelentkezés során." };
      }
    }
    throw error;
  }
}
