import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";

export default async function RegisterNewPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";

  const dict: Record<Language, { 
    title: string; 
    subtitle: string; 
    description: string;
    form_title: string;
    step1_title: string;
    step2_title: string;
    step3_title: string;
    social_login_prefix: string;
    google_login: string;
    facebook_login: string;
    email_divider: string;
    email_label: string;
    email_placeholder: string;
    password_label: string;
    password_placeholder: string;
    confirm_label: string;
    accept_terms_prefix: string;
    terms_link: string;
    read_privacy_prefix: string;
    privacy_link: string;
    lastname_label: string;
    lastname_placeholder: string;
    firstname_label: string;
    firstname_placeholder: string;
    phone_label: string;
    phone_placeholder: string;
    country_label: string;
    country_placeholder: string;
    zip_label: string;
    zip_placeholder: string;
    city_label: string;
    city_placeholder: string;
    street_label: string;
    street_placeholder: string;
    company_label: string;
    company_placeholder: string;
    tax_label: string;
    tax_placeholder: string;
    expertise_label: string;
    expertise_placeholder: string;
    interests_label: string;
    interests_placeholder: string;
    lms_info: string;
    back: string;
    next: string;
    submit: string;
    submitting: string;
    have_account: string;
    login_link: string;
  }> = {
    hu: {
      title: "Regisztráció",
      subtitle: "Csatlakozz a Hangakadémia közösségéhez és kezdd el a belső utazásodat még ma.",
      description: "Regisztrálj, és máris böngészhetsz a webshopunk folyamatosan frissülő, hatalmas termékkínálatából és exkluzív akcióiból, miközben az LMS rendszerünkben azonnal hozzáférsz az összes kurzusunkhoz és tananyagunkhoz.",
      form_title: "Hozd létre a fiókodat néhány lépésben",
      step1_title: "Alapadatok",
      step2_title: "Személyes adatok",
      step3_title: "Tanulói profil",
      social_login_prefix: "Regisztráció ezzel:",
      google_login: "Regisztráció Google fiókkal",
      facebook_login: "Regisztráció Facebook fiókkal",
      email_divider: "Vagy regisztrálj email címmel:",
      email_label: "E-mail cím*",
      password_label: "Jelszó*",
      confirm_label: "Megerősítés*",
      accept_terms_prefix: "Elfogadom az",
      terms_link: "Általános Szerződési Feltételeket",
      read_privacy_prefix: "Elolvastam és elfogadom az",
      privacy_link: "Adatkezelési Tájékoztatót",
      lastname_label: "Vezetéknév",
      firstname_label: "Keresztnév",
      phone_label: "Telefonszám",
      country_label: "Ország",
      zip_label: "Irányítószám",
      city_label: "Város",
      street_label: "Utca, házszám",
      company_label: "Cégnév (opcionális)",
      tax_label: "Adószám (opcionális)",
      expertise_label: "Szakterület",
      expertise_placeholder: "Válassz szakterületet",
      interests_label: "Érdeklődési kör",
      interests_placeholder: "Mi érdekelt leginkább?",
      email_placeholder: "pelda@email.com",
      password_placeholder: "••••••••",
      lastname_placeholder: "Kovács",
      firstname_placeholder: "János",
      phone_placeholder: "+36 30 123 4567",
      country_placeholder: "Magyarország",
      zip_placeholder: "1234",
      city_placeholder: "Budapest",
      street_placeholder: "Példa utca 12.",
      company_placeholder: "Példa Kft.",
      tax_placeholder: "12345678-1-12",
      lms_info: "Ezek az adatok szükségesek ahhoz, hogy a tanúsítványaid és hivatalos dokumentumaid a megfelelő adatokkal kerüljenek kiállításra.",
      back: "Vissza",
      next: "Folytatás",
      submit: "Fiók létrehozása",
      submitting: "Küldés...",
      have_account: "Már van fiókod?",
      login_link: "Jelentkezz be!",
    },
    en: {
      title: "Registration",
      subtitle: "Join the Sound Academy community and start your inner journey today.",
      description: "Register now and instantly browse our massive, constantly updated product catalog and exclusive deals, while gaining immediate access to all our courses and learning materials in our LMS.",
      form_title: "Create your account in a few steps",
      step1_title: "Basic Info",
      step2_title: "Personal Info",
      step3_title: "Student Profile",
      social_login_prefix: "Register with:",
      google_login: "Register with Google",
      facebook_login: "Register with Facebook",
      email_divider: "Or register with email address:",
      email_label: "E-mail address*",
      password_label: "Password*",
      confirm_label: "Confirm Password*",
      accept_terms_prefix: "I accept the",
      terms_link: "Terms and Conditions",
      read_privacy_prefix: "I have read and accept the",
      privacy_link: "Privacy Policy",
      lastname_label: "Last Name",
      firstname_label: "First Name",
      phone_label: "Phone Number",
      country_label: "Country",
      zip_label: "Zip Code",
      city_label: "City",
      street_label: "Street, House Number",
      company_label: "Company Name (optional)",
      tax_label: "Tax Number (optional)",
      expertise_label: "Expertise",
      expertise_placeholder: "Select expertise",
      interests_label: "Interests",
      interests_placeholder: "What interests you most?",
      email_placeholder: "example@email.com",
      password_placeholder: "••••••••",
      lastname_placeholder: "Doe",
      firstname_placeholder: "John",
      phone_placeholder: "+36 30 123 4567",
      country_placeholder: "Hungary",
      zip_placeholder: "1234",
      city_placeholder: "Budapest",
      street_placeholder: "Example street 12.",
      company_placeholder: "Example Ltd.",
      tax_placeholder: "12345678-1-12",
      lms_info: "We will use this information to accurately generate your official documents and the certificates you earn upon completing our courses.",
      back: "Back",
      next: "Next",
      submit: "Create Account",
      submitting: "Sending...",
      have_account: "Already have an account?",
      login_link: "Log in!",
    },
    sk: {
      title: "Registrácia",
      subtitle: "Pripojte sa ku komunite Zvukovej akadémie a začnite svoju vnútornú cestu ešte dnes.",
      description: "Zaregistrujte sa a okamžite môžete prehľadávať našu obrovskú, neustále aktualizovanú ponuku produktov a exkluzívnych akcií, pričom v našom LMS systéme získate okamžitý prístup ku všetkým našim kurzom a študijným materiálom.",
      form_title: "Vytvorte si účet v niekoľkých krokoch",
      step1_title: "Základné údaje",
      step2_title: "Osobné údaje",
      step3_title: "Profil študenta",
      social_login_prefix: "Zaregistrujte sa pomocou:",
      google_login: "Zaregistrujte sa cez Google",
      facebook_login: "Zaregistrujte sa cez Facebook",
      email_divider: "Alebo sa zaregistrujte pomocou e-mailovej adresy:",
      email_label: "E-mailová adresa*",
      password_label: "Heslo*",
      confirm_label: "Potvrdiť heslo*",
      accept_terms_prefix: "Súhlasím s",
      terms_link: "Všeobecnými obchodnými podmienkami",
      read_privacy_prefix: "Prečítal som si a súhlasím s",
      privacy_link: "Zásadami ochrany osobných údajov",
      lastname_label: "Priezvisko",
      firstname_label: "Meno",
      phone_label: "Telefónne číslo",
      country_label: "Krajina",
      zip_label: "PSČ",
      city_label: "Mesto",
      street_label: "Ulica, číslo domu",
      company_label: "Názov spoločnosti (voliteľné)",
      tax_label: "IČO (voliteľné)",
      expertise_label: "Oblasť odbornosti",
      expertise_placeholder: "Vyberte odbornosť",
      interests_label: "Záujmy",
      interests_placeholder: "Čo vás najviac zaujíma?",
      email_placeholder: "priklad@email.com",
      password_placeholder: "••••••••",
      lastname_placeholder: "Kováč",
      firstname_placeholder: "Ján",
      phone_placeholder: "+421 9xx xxx xxx",
      country_placeholder: "Slovensko",
      zip_placeholder: "12345",
      city_placeholder: "Bratislava",
      street_placeholder: "Príkladná ulica 12",
      company_placeholder: "Príklad s.r.o.",
      tax_placeholder: "1234567890",
      lms_info: "Tieto údaje použijeme na presné vystavenie vašich oficiálnych dokumentov a certifikátov, ktoré získate po absolvovaní našich kurzov.",
      back: "Späť",
      next: "Ďalej",
      submit: "Vytvoriť účet",
      submitting: "Odosielanie...",
      have_account: "Už máte účet?",
      login_link: "Prihláste sa!",
    }
  };

  const t = dict[lang];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-4 max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <div className="mb-16 space-y-6 text-center max-w-3xl">
        <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl text-brand-brown tracking-tight font-bold">
          {t.title}
        </h1>
        <div className="space-y-4">
          <p className="text-xl md:text-2xl text-brand-black/80 font-cormorant italic leading-relaxed">
            &quot;{t.subtitle}&quot;
          </p>
          <p className="text-normal text-brand-black/60 font-montserrat max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <section className="w-full max-w-4xl bg-brand-bronze/5 rounded-3xl p-8 md:p-16 border border-brand-bronze/10">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold mb-4 italic">
            {t.form_title}
          </h2>
          <div className="w-24 h-px bg-brand-bronze/30 mx-auto"></div>
        </div>

        <RegistrationForm t={t} />
      </section>
    </div>
  );
}
