import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HHM Shop & LMS Admin",
  description: "Modular Webshop and Learning Management System",
};

import { LanguageProvider } from "@/context/language-context";
import { cookies } from "next/headers";
import { Language, SUPPORTED_LANGUAGES } from "@/modules/shared/lib/i18n-constants";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("app_lang")?.value as Language;
  const initialLang: Language = (langCookie && SUPPORTED_LANGUAGES.includes(langCookie)) ? langCookie : "hu";

  return (
    <html lang={initialLang}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider initialLanguage={initialLang}>
          <main className="min-h-screen relative">{children}</main>
        </LanguageProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
