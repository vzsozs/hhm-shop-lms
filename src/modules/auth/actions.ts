"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "@/db";
import { users, profiles, addresses, verificationTokens } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "@/lib/email/email-service";

import { 
  registerSchema, 
  loginSchema, 
  registerUserNewSchema, 
  userAdminUpdateSchema,
  userProfileUpdateSchema 
} from "./schemas";

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
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Hibás adatok formátuma!" };
    }

    await signIn("credentials", {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
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

export async function deleteUser(userId: string) {
  try {
    const session = await auth();

    // 1. Jogosultság ellenőrzése (csak admin)
    if (!session || session.user.role !== "admin") {
      return { error: "Nincs jogosultságod a felhasználó törléséhez!" };
    }

    // 2. Önvédelem (admin nem törölheti saját magát)
    if (session.user.id === userId) {
      return { error: "Biztonsági okokból nem törölheted a saját fiókodat!" };
    }

    // Létrehozunk egy tranzakciót a tokenek és a felhasználó törléséhez
    await db.transaction(async (tx) => {
      // 3. Felhasználó lekérése, hogy megkapjuk az email címét a token törléshez
      const userToDelete = await tx.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!userToDelete) {
        throw new Error("A felhasználó nem található!");
      }

      // 4. Tokenek törlése az email cím (identifier) alapján
      await tx.delete(verificationTokens)
        .where(eq(verificationTokens.identifier, userToDelete.email));

      // 5. Felhasználó törlése (Profiles, Addresses stb. CASCADE törléssel automatikusan el lesznek távolítva)
      await tx.delete(users).where(eq(users.id, userId));
    });

    // Táblázat újratöltése a kliens oldalon
    revalidatePath("/admin/users");

    return { success: "Célpont megsemmisítve! (A felhasználó és adatai törlésre kerültek)" };
  } catch (error) {
    console.error("Hiba a felhasználó törlésekor:", error);
    return { error: "Váratlan hiba történt a törlés során." };
  }
}
export async function registerUserNew(values: z.infer<typeof registerUserNewSchema>) {
  try {
    const validatedFields = registerUserNewSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Hibásan kitöltött mezők!" };
    }

    const { 
      email, password, firstName, lastName, phone, 
      country, zip, city, street, companyName, taxNumber,
      expertise, interests 
    } = validatedFields.data;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "Ez az e-mail cím már foglalt!" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = [lastName, firstName].filter(Boolean).join(" ") || email.split("@")[0];

    // Tranzakció: User, Profile és Address létrehozása együtt
    await db.transaction(async (tx) => {
      const [newUser] = await tx.insert(users).values({
        email,
        passwordHash,
        name: fullName,
        role: "user",
      }).returning();

      await tx.insert(profiles).values({
        userId: newUser.id,
        name: fullName,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        expertise: expertise || null,
        interests: interests || null,
        lang: "hu",
      });

      // Csak akkor szúrunk be címet, ha legalább az egyik mező ki van töltve
      if (country || zip || city || street || companyName || taxNumber) {
        await tx.insert(addresses).values({
          userId: newUser.id,
          type: "billing",
          name: fullName,
          country: country || null,
          zip: zip || "", // Zip, city, street NOT NULL a sémában, így üres stringet adunk ha nincs meg
          city: city || "",
          street: street || "",
          taxNumber: taxNumber || null,
          companyName: companyName || null,
        });
      }
      
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

    // Üdvözlő e-mail küldése
    sendWelcomeEmail(email, fullName, verifyUrl).catch((err) => {
      console.error("Nem sikerült elküldeni az üdvözlő e-mailt a regisztráció után:", err);
    });

    return { success: "Sikeres regisztráció! Kérlek, erősítsd meg az e-mail címedet a kapott levélben." };
  } catch (error) {
    console.error("Hiba a regisztráció során:", error);
    return { error: "Váratlan hiba történt a regisztráció során." };
  }
}

export async function updateUserByAdmin(userId: string, values: z.infer<typeof userAdminUpdateSchema>) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return { error: "Nincs jogosultságod ehhez a művelethez!" };
    }

    const validatedFields = userAdminUpdateSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Hibás adatok!" };
    }

    const { 
      role, firstName, lastName, phone, lang, expertise, interests,
      billing_country, billing_zip, billing_city, billing_street, billing_companyName, billing_taxNumber,
      shipping_country, shipping_zip, shipping_city, shipping_street
    } = validatedFields.data;

    const fullName = [lastName, firstName].filter(Boolean).join(" ");

    await db.transaction(async (tx) => {
      // 1. User alap adatok frissítése (szerepkör és név)
      await tx.update(users)
        .set({ role, name: fullName || undefined, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // 2. Profil frissítése vagy létrehozása
      const existingProfile = await tx.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
      });

      const profileData = {
        userId,
        name: fullName || null,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        lang: lang || "hu",
        expertise: expertise || null,
        interests: interests || null,
      };

      if (existingProfile) {
        await tx.update(profiles)
          .set(profileData)
          .where(eq(profiles.userId, userId));
      } else {
        await tx.insert(profiles).values(profileData);
      }

      // 3. Számlázási cím frissítése (ha van megadva lényegi adat)
      if (billing_zip || billing_city || billing_street) {
        const existingBilling = await tx.query.addresses.findFirst({
          where: (addresses, { and, eq }) => and(eq(addresses.userId, userId), eq(addresses.type, "billing")),
        });

        const billingData = {
          userId,
          type: "billing" as const,
          name: fullName || "Számlázási név",
          country: billing_country || "HU",
          zip: billing_zip || "",
          city: billing_city || "",
          street: billing_street || "",
          companyName: billing_companyName || null,
          taxNumber: billing_taxNumber || null,
        };

        if (existingBilling) {
          await tx.update(addresses)
            .set(billingData)
            .where(eq(addresses.id, existingBilling.id));
        } else {
          await tx.insert(addresses).values(billingData);
        }
      }

      // 4. Szállítási cím frissítése (ha van megadva lényegi adat)
      if (shipping_zip || shipping_city || shipping_street) {
        const existingShipping = await tx.query.addresses.findFirst({
          where: (addresses, { and, eq }) => and(eq(addresses.userId, userId), eq(addresses.type, "shipping")),
        });

        const shippingData = {
          userId,
          type: "shipping" as const,
          name: fullName || "Szállítási név",
          country: shipping_country || "HU",
          zip: shipping_zip || "",
          city: shipping_city || "",
          street: shipping_street || "",
        };

        if (existingShipping) {
          await tx.update(addresses)
            .set(shippingData)
            .where(eq(addresses.id, existingShipping.id));
        } else {
          await tx.insert(addresses).values(shippingData);
        }
      }
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);
    
    return { success: "Felhasználó adatai sikeresen frissítve!" };
  } catch (error) {
    console.error("Hiba a felhasználó frissítésekor:", error);
    return { error: "Váratlan hiba történt a frissítés során." };
  }
}

export async function updateSelf(values: z.infer<typeof userProfileUpdateSchema>) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { error: "Nem vagy bejelentkezve!" };
    }

    const userId = session.user.id;
    const validatedFields = userProfileUpdateSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Hibás adatok!" };
    }

    const { 
      firstName, lastName, phone, lang, expertise, interests,
      billing_country, billing_zip, billing_city, billing_street, billing_companyName, billing_taxNumber,
      shipping_country, shipping_zip, shipping_city, shipping_street
    } = validatedFields.data;

    const fullName = [lastName, firstName].filter(Boolean).join(" ");

    await db.transaction(async (tx) => {
      // 1. User név frissítése
      await tx.update(users)
        .set({ name: fullName || undefined, updatedAt: new Date() })
        .where(eq(users.id, userId));

      // 2. Profil frissítése vagy létrehozása
      const profileData = {
        userId,
        name: fullName || null,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        lang: lang || "hu",
        expertise: expertise || null,
        interests: interests || null,
      };

      const existingProfile = await tx.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
      });

      if (existingProfile) {
        await tx.update(profiles)
          .set(profileData)
          .where(eq(profiles.userId, userId));
      } else {
        await tx.insert(profiles).values(profileData);
      }

      // 3. Számlázási cím
      if (billing_zip || billing_city || billing_street) {
        const existingBilling = await tx.query.addresses.findFirst({
          where: (addresses, { and, eq }) => and(eq(addresses.userId, userId), eq(addresses.type, "billing")),
        });

        const billingData = {
          userId,
          type: "billing" as const,
          name: fullName || "Számlázási név",
          country: billing_country || "HU",
          zip: billing_zip || "",
          city: billing_city || "",
          street: billing_street || "",
          companyName: billing_companyName || null,
          taxNumber: billing_taxNumber || null,
        };

        if (existingBilling) {
          await tx.update(addresses)
            .set(billingData)
            .where(eq(addresses.id, existingBilling.id));
        } else {
          await tx.insert(addresses).values(billingData);
        }
      }

      // 4. Szállítási cím
      if (shipping_zip || shipping_city || shipping_street) {
        const existingShipping = await tx.query.addresses.findFirst({
          where: (addresses, { and, eq }) => and(eq(addresses.userId, userId), eq(addresses.type, "shipping")),
        });

        const shippingData = {
          userId,
          type: "shipping" as const,
          name: fullName || "Szállítási név",
          country: shipping_country || "HU",
          zip: shipping_zip || "",
          city: shipping_city || "",
          street: shipping_street || "",
        };

        if (existingShipping) {
          await tx.update(addresses)
            .set(shippingData)
            .where(eq(addresses.id, existingShipping.id));
        } else {
          await tx.insert(addresses).values(shippingData);
        }
      }
    });

    revalidatePath("/profil");
    // Admin oldalt is revalidáljuk ha az admin szerkeszti önmagát a public oldalon (bár ez ritka)
    revalidatePath("/admin/users");
    
    return { success: "Profilod sikeresen frissítve!" };
  } catch (error) {
    console.error("Hiba a profil frissítésekor:", error);
    return { error: "Váratlan hiba történt a frissítés során." };
  }
}

