"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { users, profiles, verificationTokens } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "@/lib/email/email-service";

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
      
      return newUser;
    });

    // Cél URL generálás
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationTokenBytes = crypto.randomBytes(32).toString("hex");
    
    // Elévülés: 24 óra múlva
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await db.insert(verificationTokens).values({
      identifier: email,
      token: verificationTokenBytes,
      expires: expires,
    });

    const verifyUrl = `${baseUrl}/api/auth/verify?token=${verificationTokenBytes}`;

    // Üdvözlő e-mail küldése aszinkron a háttérben
    sendWelcomeEmail(email, name, verifyUrl).catch((err) => {
      console.error("Nem sikerült elküldeni az üdvözlő e-mailt a regisztráció után:", err);
    });

    return { success: "Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet a kapott levélben." };
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

export async function toggleUserRole(userId: string, newRole: "admin" | "user") {
  try {
    const session = await auth();
    
    // Jogosultság ellenőrzése
    if (!session || session.user.role !== "admin") {
      return { error: "Nincs jogosultságod ehhez a művelethez!" };
    }

    // Önvédelmi szabály: az aktuális felhasználó nem módosíthatja a saját jogát!
    if (session.user.id === userId) {
      return { error: "Nem módosíthatod a saját jogosultságodat!" };
    }

    // Szerepkör frissítése az adatbázisban
    await db.update(users)
      .set({ role: newRole, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Cache frissítése a táblázathoz
    revalidatePath("/admin/users");
    
    return { success: `Szerepkör sikeresen frissítve (${newRole})!` };
  } catch (error) {
    console.error("Hiba a jogosultság módosításakor:", error);
    return { error: "Váratlan hiba történt a művelet során." };
  }
}
