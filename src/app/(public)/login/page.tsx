import { LoginForm, LoginTranslations } from "@/components/auth/LoginForm";
import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";
  const params = await searchParams;

  const isVerified = params.verified === "true";
  const errorParam = params.error as string | undefined;

  const dict: Record<Language, LoginTranslations & { 
    page_title: string; 
    page_subtitle: string; 
    page_description: string;
    form_card_title: string;
    verified_success: string;
    error_token_not_found: string;
    error_token_expired: string;
    error_email_not_found: string;
    error_invalid_token: string;
    error_default: string;
  }> = {
    hu: {
      page_title: "Bejelentkezés",
      page_subtitle: "Üdvözöljük újra a Hangakadémián!",
      page_description: "Lépjen be fiókjába, hogy folytathassa tanulmányait és elérje megvásárolt kurzusait az LMS rendszerünkben.",
      form_card_title: "Bejelentkezés a fiókodba",
      title: "Bejelentkezés",
      subtitle: "Add meg az adataidat",
      email_label: "E-mail cím",
      email_placeholder: "pelda@email.com",
      password_label: "Jelszó",
      password_placeholder: "••••••••",
      forgot_password: "Elfelejtetted?",
      submit: "Bejelentkezés",
      submitting: "Bejelentkezés folyamatban...",
      social_login_prefix: "Bejelentkezés ezzel:",
      google_login: "Bejelentkezés Google fiókkal",
      facebook_login: "Bejelentkezés Facebook fiókkal",
      email_divider: "Vagy használd az email címedet:",
      no_account: "Még nincs fiókod?",
      register_link: "Regisztrálj most!",
      verified_success: "Fiókodat sikeresen megerősítettük! Most már bejelentkezhetsz.",
      error_token_not_found: "A megerősítő link érvénytelen vagy már felhasználták.",
      error_token_expired: "A megerősítő link lejárt. Kérlek, kérj újat.",
      error_email_not_found: "A megerősítéshez tartozó fiók nem található.",
      error_invalid_token: "Hiányzó vagy érvénytelen azonosító.",
      error_default: "Hiba történt a megerősítés során.",
    },
    en: {
      page_title: "Sign In",
      page_subtitle: "Welcome back to Sound Academy!",
      page_description: "Log in to your account to continue your studies and access your purchased courses in our LMS.",
      form_card_title: "Sign in to your account",
      title: "Sign In",
      subtitle: "Enter your credentials",
      email_label: "Email Address",
      email_placeholder: "example@email.com",
      password_label: "Password",
      password_placeholder: "••••••••",
      forgot_password: "Forgot?",
      submit: "Sign In",
      submitting: "Signing in...",
      social_login_prefix: "Sign in with:",
      google_login: "Sign in with Google",
      facebook_login: "Sign in with Facebook",
      email_divider: "Or use your email address:",
      no_account: "Don't have an account?",
      register_link: "Register now!",
      verified_success: "Your account has been successfully verified! You can now log in.",
      error_token_not_found: "The verification link is invalid or has already been used.",
      error_token_expired: "The verification link has expired. Please request a new one.",
      error_email_not_found: "The account for this verification was not found.",
      error_invalid_token: "Missing or invalid identifier.",
      error_default: "An error occurred during verification.",
    },
    sk: {
      page_title: "Prihlásenie",
      page_subtitle: "Vitajte späť v Zvukovej akadémii!",
      page_description: "Prihláste sa do svojho účtu, aby ste mohli pokračovať v štúdiu a pristupovať k zakúpeným kurzom v našom systéme LMS.",
      form_card_title: "Prihlásenie do vášho účtu",
      title: "Prihlásenie",
      subtitle: "Zadajte svoje údaje",
      email_label: "E-mailová adresa",
      email_placeholder: "priklad@email.com",
      password_label: "Heslo",
      password_placeholder: "••••••••",
      forgot_password: "Zabudli ste?",
      submit: "Prihlásiť sa",
      submitting: "Prihlasovanie...",
      social_login_prefix: "Prihlásiť sa pomocou:",
      google_login: "Prihlásiť sa cez Google",
      facebook_login: "Prihlásiť sa cez Facebook",
      email_divider: "Alebo použite svoju e-mailovú adresu:",
      no_account: "Ešte nemáte účet?",
      register_link: "Zaregistrujte sa teraz!",
      verified_success: "Váš účet bol úspešne overený! Teraz sa môžete prihlásiť.",
      error_token_not_found: "Overovací odkaz je neplatný alebo už bol použitý.",
      error_token_expired: "Overovací odkaz vypršal. Požiadajte o nový.",
      error_email_not_found: "Účet pre toto overenie sa nenašiel.",
      error_invalid_token: "Chýbajúci alebo neplatný identifikátor.",
      error_default: "Počas overovania sa vyskytla chyba.",
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

      <div className="w-full max-w-4xl">
        {isVerified && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 p-6 rounded-3xl flex items-start gap-4 text-lg font-montserrat mb-8 backdrop-blur-sm">
            <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-green-600" />
            <p>{t.verified_success}</p>
          </div>
        )}

        {errorParam && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-700 p-6 rounded-3xl flex items-start gap-4 text-lg font-montserrat mb-8 backdrop-blur-sm">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-600" />
            <p>
              {errorParam === "TokenNotFound" && t.error_token_not_found}
              {errorParam === "TokenExpired" && t.error_token_expired}
              {errorParam === "EmailNotFound" && t.error_email_not_found}
              {errorParam === "InvalidToken" && t.error_invalid_token}
              {errorParam === "Default" && t.error_default}
            </p>
          </div>
        )}
      </div>

      {/* Form Section */}
      <section className="w-full max-w-4xl bg-brand-bronze/5 rounded-3xl p-8 md:p-16 border border-brand-bronze/10">
        <div className="text-center mb-12">
          <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold mb-4 italic">
            {t.form_card_title}
          </h2>
          <div className="w-24 h-px bg-brand-bronze/30 mx-auto"></div>
        </div>

        <LoginForm t={t} />
      </section>
    </div>
  );
}
