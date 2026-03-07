import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "./templates/WelcomeEmail";
import React from 'react';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const senderEmail = process.env.EMAIL_FROM || "onboarding@resend.dev"; // Használd a saját domainedet élesben

export async function sendWelcomeEmail(to: string, name: string, verifyUrl: string) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY nincs beállítva. Az email küldés ki van hagyva.");
    console.warn(`Simulált küldés ide: ${to}. Link: ${verifyUrl}`);
    return { success: true, simulated: true };
  }

  try {
    const htmlBody = await render(React.createElement(WelcomeEmail, { userName: name, verifyUrl }));

    const data = await resend.emails.send({
      from: `HHM Shop & LMS <${senderEmail}>`,
      to: [to],
      subject: "Üdvözlünk a Hangakadémián! Kérlek erősítsd meg az e-mail címed.",
      html: htmlBody,
    });

    if (data.error) {
      console.error("Hiba a Resend küldésből:", data.error);
      return { error: data.error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Kritikus hiba az email küldése során:", error);
    return { error: "Nem sikerült elküldeni a levelet." };
  }
}
