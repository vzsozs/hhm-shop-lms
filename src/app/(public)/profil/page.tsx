import { auth } from "@/auth";
import { db } from "@/db";
import { users, profiles, addresses } from "@/db/schema/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";
import { ProfileForm, ProfileFormTranslations } from "@/components/auth/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";

  // Adatok lekérése
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    redirect("/login");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  const userAddresses = await db.query.addresses.findMany({
    where: eq(addresses.userId, userId),
  });

  const billingAddress = userAddresses.find((a) => a.type === "billing");
  const shippingAddress = userAddresses.find((a) => a.type === "shipping");

  const initialValues = {
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    phone: profile?.phone,
    lang: profile?.lang || "hu",
    expertise: profile?.expertise,
    interests: profile?.interests,
    
    billing_country: billingAddress?.country,
    billing_zip: billingAddress?.zip,
    billing_city: billingAddress?.city,
    billing_street: billingAddress?.street,
    billing_companyName: billingAddress?.companyName,
    billing_taxNumber: billingAddress?.taxNumber,

    shipping_country: shippingAddress?.country,
    shipping_zip: shippingAddress?.zip,
    shipping_city: shippingAddress?.city,
    shipping_street: shippingAddress?.street,
  };

  const dict: Record<Language, ProfileFormTranslations & { 
    page_title: string; 
    page_subtitle: string; 
    page_description: string;
    form_card_title: string;
  }> = {
    hu: {
      page_title: "Profil Szerkesztése",
      page_subtitle: "Kezeld a személyes adataidat és beállításaidat",
      page_description: "Itt módosíthatod a számlázási és szállítási címeidet, valamint a szakmai profilodat.",
      form_card_title: "Személyes adatok és beállítások",
      personal_section: "Személyes adatok",
      professional_section: "Szakmai profil",
      billing_section: "Számlázási adatok",
      shipping_section: "Szállítási adatok",
      firstname_label: "Keresztnév",
      lastname_label: "Vezetéknév",
      phone_label: "Telefonszám",
      lang_label: "Alapértelmezett nyelv",
      expertise_label: "Szakterület",
      interests_label: "Érdeklődési kör",
      country_label: "Ország",
      zip_label: "Irányítószám",
      city_label: "Város",
      street_label: "Utca, házszám",
      company_label: "Cégnév (opcionális)",
      tax_label: "Adószám (opcionális)",
      logout: "Kijelentkezés",
      submit: "Módosítások mentése",
      submitting: "Mentés folyamatban...",
      success: "A profilod sikeresen frissítve lett!",
    },
    en: {
      page_title: "Edit Profile",
      page_subtitle: "Manage your personal information and settings",
      page_description: "Here you can modify your billing and shipping addresses, as well as your professional profile.",
      form_card_title: "Personal details and settings",
      personal_section: "Personal details",
      professional_section: "Professional profile",
      billing_section: "Billing address",
      shipping_section: "Shipping address",
      firstname_label: "First Name",
      lastname_label: "Last Name",
      phone_label: "Phone Number",
      lang_label: "Default Language",
      expertise_label: "Expertise",
      interests_label: "Interests",
      country_label: "Country",
      zip_label: "Zip Code",
      city_label: "City",
      street_label: "Street Address",
      company_label: "Company Name (optional)",
      tax_label: "Tax Number (optional)",
      logout: "Log Out",
      submit: "Save Changes",
      submitting: "Saving...",
      success: "Your profile has been successfully updated!",
    },
    sk: {
      page_title: "Upraviť profil",
      page_subtitle: "Spravujte svoje osobné údaje a nastavenia",
      page_description: "Tu môžete zmeniť svoje fakturačné a doručovacie adresy, ako aj svoj profesionálny profil.",
      form_card_title: "Osobné údaje a nastavenia",
      personal_section: "Osobné údaje",
      professional_section: "Profesionálny profil",
      billing_section: "Fakturačné údaje",
      shipping_section: "Doručovacie údaje",
      firstname_label: "Meno",
      lastname_label: "Priezvisko",
      phone_label: "Telefónne číslo",
      lang_label: "Predvolený jazyk",
      expertise_label: "Odbornosť",
      interests_label: "Záujmy",
      country_label: "Krajina",
      zip_label: "PSČ",
      city_label: "Mesto",
      street_label: "Ulica a číslo",
      company_label: "Názov spoločnosti (voliteľné)",
      tax_label: "DIČ (voliteľné)",
      logout: "Odhlásiť sa",
      submit: "Uložiť zmeny",
      submitting: "Ukladá sa...",
      success: "Váš profil bol úspešne aktualizovaný!",
    }
  };

  const t = dict[lang];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-4 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <div className="mb-16 space-y-6 text-center max-w-3xl">
        <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl text-brand-brown tracking-tight font-bold">
          {t.page_title}
        </h1>
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-brand-black/80 font-cormorant italic leading-relaxed">
            &quot;{t.page_subtitle}&quot;
          </p>
          <p className="text-normal text-brand-black/60 font-montserrat max-w-2xl mx-auto leading-relaxed">
            {t.page_description}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <section className="w-full max-w-4xl bg-brand-bronze/5 rounded-3xl p-8 md:p-16 border border-brand-bronze/10">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold mb-4 italic">
            {t.form_card_title}
          </h2>
          <div className="w-24 h-px bg-brand-bronze/30 mx-auto"></div>
        </div>

        <ProfileForm initialData={initialValues} t={t} />
      </section>
    </div>
  );
}
