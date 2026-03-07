"use server";

import { auth } from "@/auth";
import { sendWelcomeEmail } from "./email-service";

export async function sendTestEmailAction() {
  try {
    const session = await auth();

    // Szigorú admin védelem biztonsági okokból
    if (!session || session.user.role !== "admin") {
      return { error: "Nincs jogosultságod e-mailt küldeni." };
    }

    const adminEmail = session.user.email;
    const adminName = session.user.name || "Adminisztrátor";
    
    if (!adminEmail) {
      return { error: "A fiókodhoz nem tartozik e-mail cím." };
    }

    // Elküldünk egy beégetett Dummy linket teszt gyanánt
    const dummyVerifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=teszt-token-123`;
    
    const result = await sendWelcomeEmail(adminEmail, adminName, dummyVerifyUrl);

    if (result.error) {
       return { error: `Műszaki hiba: ${result.error}` };
    }

    if (result.simulated) {
      return { success: "⚠️ Szimulált küldés sikeres (Nincs API kulcs beállítva)!" };
    }

    return { success: `Teszt e-mail sikeresen elküldve ide: ${adminEmail}!` };
  } catch (error) {
    console.error("Váratlan hiba a teszt e-mail során:", error);
    return { error: "Szerverhiba történt az e-mail küldésekor." };
  }
}
