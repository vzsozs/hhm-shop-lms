import { cookies } from "next/headers";
import { Language } from "@/modules/shared/lib/i18n-constants";
import { Phone, Mail, MapPin, Clock, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default async function ContactPage() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "hu";

  const dict: Record<Language, any> = {
    hu: {
      title: "Kapcsolat",
      subtitle: "Ha felkeltettem az érdeklődésedet, szeretettel várlak Budapesten, a Hangakadémián, ahol egyedi atmoszféra és kertvárosi környezet vár.",
      description: "A komfortos frekvenciákban gazdag hangulat segít abban, hogy a lelked is megtalálja a harmóniát.",
      phone: "Telefon",
      email: "Email",
      training: "Oktatás",
      address: "Cím",
      address_val: "1188 Budapest, Nemes u. 88.",
      opening: "Nyitva tartás",
      opening_val: "Előzetes egyeztetés alapján",
      form_title: "Lépj kapcsolatba velem és beszéljünk meg egy időpontot",
      name_label: "Neved*",
      email_label: "Email címed*",
      phone_label: "Telefon számod",
      message_label: "Üzenet",
      submit: "Küldés",
      sending: "Kérlek várj...",
      reviews_title: "Vélemények",
    },
    en: {
      title: "Contact",
      subtitle: "If I've piqued your interest, I look forward to welcoming you to the Sound Academy in Budapest, where a unique atmosphere and suburban environment await.",
      description: "The atmosphere rich in comfortable frequencies helps your soul find harmony.",
      phone: "Phone",
      email: "Email",
      training: "Training",
      address: "Address",
      address_val: "1188 Budapest, Nemes u. 88.",
      opening: "Opening Hours",
      opening_val: "By appointment only",
      form_title: "Get in touch and let's schedule an appointment",
      name_label: "Your Name*",
      email_label: "Your Email*",
      phone_label: "Your Phone Number",
      message_label: "Message",
      submit: "Send",
      sending: "Please wait...",
      reviews_title: "Reviews",
    },
    sk: {
      title: "Kontakt",
      subtitle: "Ak som vás zaujala, rada vás privítam v Zvukovej akadémii v Budapešti, kde na vás čaká jedinečná atmosféra a prímestské prostredie.",
      description: "Atmosféra bohatá na príjemné frekvencie pomáha vašej duši nájsť harmóniu.",
      phone: "Telefón",
      email: "Email",
      training: "Vzdelávanie",
      address: "Adresa",
      address_val: "1188 Budapest, Nemes u. 88.",
      opening: "Otváracie hodiny",
      opening_val: "Na základe predchádzajúcej dohody",
      form_title: "Kontaktujte ma a dohodnime si termín",
      name_label: "Vaše meno*",
      email_label: "Váš Email*",
      phone_label: "Vaše telefónne číslo",
      message_label: "Správa",
      submit: "Odoslať",
      sending: "Prosím čakajte...",
      reviews_title: "Recenzie",
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
            "{t.subtitle}"
          </p>
          <p className="text-lg text-brand-black/60 font-montserrat max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>
      </div>

      {/* Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full mb-20 items-stretch">
        {/* Info Column */}
        <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-brand-bronze/10 shadow-sm flex flex-col justify-center gap-8">
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bronze/10 flex items-center justify-center shrink-0 border border-brand-bronze/5">
                <Phone className="w-5 h-5 text-brand-bronze" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-brand-bronze font-bold mb-1">{t.phone}</h3>
                <a href="tel:+36307402048" className="text-2xl font-cormorant font-bold text-brand-brown hover:text-brand-sienna transition-colors">
                  +3630 740 2048
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bronze/10 flex items-center justify-center shrink-0 border border-brand-bronze/5">
                <Mail className="w-5 h-5 text-brand-bronze" />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-brand-bronze font-bold mb-1">{t.email}</h3>
                  <a href="mailto:hangakademia@gmail.com" className="text-xl font-cormorant font-bold text-brand-brown hover:text-brand-sienna transition-colors block">
                    hangakademia@gmail.com
                  </a>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-brand-bronze font-bold mb-1 leading-none flex items-center gap-2">
                    <GraduationCap className="size-3" /> {t.training}
                  </h3>
                  <a href="mailto:oktatas@hangakademia.hu" className="text-xl font-cormorant font-bold text-brand-brown hover:text-brand-sienna transition-colors block">
                    oktatas@hangakademia.hu
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bronze/10 flex items-center justify-center shrink-0 border border-brand-bronze/5">
                <MapPin className="w-5 h-5 text-brand-bronze" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-brand-bronze font-bold mb-1">{t.address}</h3>
                <p className="text-xl font-cormorant font-bold text-brand-brown">
                  {t.address_val}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-bronze/10 flex items-center justify-center shrink-0 border border-brand-bronze/5">
                <Clock className="w-5 h-5 text-brand-bronze" />
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-brand-bronze font-bold mb-1">{t.opening}</h3>
                <p className="text-xl font-cormorant font-bold text-brand-brown italic">
                  {t.opening_val}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Column */}
        <div className="w-full h-[400px] lg:h-auto rounded-3xl overflow-hidden border border-brand-bronze/10 shadow-md">
           <iframe 
             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2703.6558661642875!2d19.19621597686526!3d47.41249969110034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741ea4f488e63f5%3A0xe5aab94dc74c760!2zQnVkYXBlc3QsIE5lbWVzIHUuIDg4LCAxMTg4!5e0!3m2!1shu!2shu!4v1700000000000!5m2!1shu!2shu" 
             width="100%" 
             height="100%" 
             style={{ border: 0 }} 
             allowFullScreen 
             loading="lazy" 
             referrerPolicy="no-referrer-when-downgrade"
           ></iframe>
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

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-brand-brown/80 ml-1">{t.name_label}</Label>
            <Input id="name" placeholder={t.name_label} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-brand-brown/80 ml-1">{t.email_label}</Label>
            <Input id="email" type="email" placeholder={t.email_label} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="phone" className="text-brand-brown/80 ml-1">{t.phone_label}</Label>
            <Input id="phone" type="tel" placeholder={t.phone_label} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="message" className="text-brand-brown/80 ml-1">{t.message_label}</Label>
            <Textarea id="message" placeholder={t.message_label} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 min-h-[150px]" />
          </div>
          <div className="md:col-span-2 flex justify-center mt-4">
            <Button size="lg" className="bg-brand-brown hover:bg-brand-black text-white px-12 py-6 text-lg rounded-full transition-all shadow-lg hover:shadow-xl font-cormorant tracking-widest uppercase">
              {t.submit}
            </Button>
          </div>
        </form>
      </section>

      {/* Reviews Section - Simplified Grid */}
      <section className="w-full mt-24 mb-16">
        <div className="text-center mb-16">
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold italic mb-4">
            {t.reviews_title}
          </h2>
          <div className="w-16 h-1 bg-brand-bronze/20 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Dóra",
              text: "Szeretném kifejezni mély hálámat, fantasztikus élmény volt, és úgy érzem, hogy újra feltöltődtem és kiegyensúlyozottabb lettem a hangtálterápiától.",
              gender: "woman"
            },
            {
              name: "Nagy Anita",
              text: "Az általad nyújtott hangtálmasszázs valódi csodát tett velem. A rezgések és gyengéd hangok együttese teljesen ellazított.",
              gender: "woman"
            },
            {
              name: "László",
              text: "A kezelés után úgy éreztem magam, mintha egy új ember lennék. Az elmém tiszta volt, és a testem könnyednek éreztem.",
              gender: "man"
            }
          ].map((review, i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm p-8 rounded-2xl border border-brand-bronze/10 shadow-sm hover:shadow-md transition-shadow relative">
               <div className="absolute top-4 right-6 text-brand-bronze/20 font-serif text-6xl leading-none">”</div>
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-full bg-brand-bronze/10 flex items-center justify-center border border-brand-bronze/5">
                   <span className="text-brand-bronze text-xs font-bold uppercase">{review.name[0]}</span>
                 </div>
                 <h4 className="font-cormorant font-bold text-lg text-brand-brown">„{review.name}”</h4>
               </div>
               <p className="text-brand-black/70 font-montserrat italic leading-relaxed line-clamp-4">
                 „{review.text}”
               </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
