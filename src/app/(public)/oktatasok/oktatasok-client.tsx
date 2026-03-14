"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Info, Users, ArrowRight, ShoppingCart, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


interface ContentDict {
  heroTitle: string;
  sectionTitle: string;
  levels: {
    basic: { name: string; desc: string; };
    intermediate: { name: string; desc: string; };
    advanced: { name: string; desc: string; };
    intensive: { name: string; desc: string; };
    tuningFork: { name: string; comingSoon: string; };
  };
  details: {
    whoIsItFor: string;
    whoIsNotItFor: string;
    philosophy: string;
    whatYouGet: string;
    whyLongTerm: string;
    importantInfo: string;
    legal: string;
    payment: string;
    reviews: string;
  };
  actions: {
    apply: string;
    addToCart: string;
  };
  labels: {
    beginner: string;
    intermediate: string;
    advanced: string;
    intensive: string;
    soon: string;
    groupTraining: string;
    privateTraining: string;
    price: string;
  };
}

const dict: Record<string, ContentDict> = {
  hu: {
    heroTitle: "Oktatások",
    sectionTitle: "Képzéseink:",
    levels: {
      basic: { name: "Himalájai Hangtálmasszázs® - Kezdő", desc: "elmélet és gyakorlat" },
      intermediate: { name: "Himalájai Hangtálmasszázs® - Középhaladó", desc: "elmélet és gyakorlat" },
      advanced: { name: "Himalájai Hangtálmasszázs® - Haladó", desc: "elmélet és gyakorlat" },
      intensive: { name: "Intenzív", desc: "Összevont alap-, közép-, felsőfokú képzés" },
      tuningFork: { name: "Rezgésterápiás hangvilla", comingSoon: "Hamarosan jelentkezünk a részletekkel…" }
    },
    details: {
      whoIsItFor: "Kinek szól ez a képzés?",
      whoIsNotItFor: "Kinek nem szól ez a képzés?",
      philosophy: "A HangAkadémia® szemlélete",
      whatYouGet: "Mit kapsz a képzéseinken?",
      whyLongTerm: "Miért vállalható ez a képzés hosszú távon?",
      importantInfo: "Fontos tudnivalók a képzésről:",
      legal: "Jogi és adatkezelési információk",
      payment: "Fizetés",
      reviews: "Vélemények:"
    },
    actions: {
      apply: "Jelentkezési lap kitöltése",
      addToCart: "Kosárba"
    },
    labels: {
      beginner: "Kezdő",
      intermediate: "Középhaladó",
      advanced: "Haladó",
      intensive: "Intenzív",
      soon: "Hamarosan",
      groupTraining: "Csoportos képzés",
      privateTraining: "Egyéni magánoktatás",
      price: "Részvételi díj"
    }
  },
  en: {
    heroTitle: "Trainings",
    sectionTitle: "Our Courses:",
    levels: {
      basic: { name: "Himalayan Sound Massage® - Beginner", desc: "theory and practice" },
      intermediate: { name: "Himalayan Sound Massage® - Intermediate", desc: "theory and practice" },
      advanced: { name: "Himalayan Sound Massage® - Advanced", desc: "theory and practice" },
      intensive: { name: "Intensive", desc: "Combined training" },
      tuningFork: { name: "Vibrational Therapy Tuning Fork", comingSoon: "Coming soon..." }
    },
    details: {
      whoIsItFor: "Who is this training for?",
      whoIsNotItFor: "Who is this training NOT for?",
      philosophy: "The HangAkadémia® philosophy",
      whatYouGet: "What do you get in our trainings?",
      whyLongTerm: "Why is this training viable in the long term?",
      importantInfo: "Important information about the training:",
      legal: "Legal and data management information",
      payment: "Payment",
      reviews: "Reviews:"
    },
    actions: {
      apply: "Registration",
      addToCart: "Add to cart"
    },
    labels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced",
      intensive: "Intensive",
      soon: "Soon",
      groupTraining: "Group training",
      privateTraining: "Private education",
      price: "Fee"
    }
  },
  sk: {
    heroTitle: "Školenia",
    sectionTitle: "Naše kurzy:",
    levels: {
      basic: { name: "Himalájska zvuková masáž® - Začiatočník", desc: "teória a prax" },
      intermediate: { name: "Himalájska zvuková masáž® - Stredne pokročilý", desc: "teória a prax" },
      advanced: { name: "Himalájska zvuková masáž® - Pokročilý", desc: "teória a prax" },
      intensive: { name: "Intenzívna", desc: "Kombinované školenie" },
      tuningFork: { name: "Vibračná terapia ladičkou", comingSoon: "Čoskoro..." }
    },
    details: {
      whoIsItFor: "Pre koho je toto školenie určené?",
      whoIsNotItFor: "Pre koho toto školenie NIE JE určené?",
      philosophy: "Filozofia HangAkadémia®",
      whatYouGet: "Čo získate na našich školeniach?",
      whyLongTerm: "Prečo je toto školenie dlhodobo udržateľné?",
      importantInfo: "Dôležité informácie o školení:",
      legal: "Právne informácie a ochrana údajov",
      payment: "Platba",
      reviews: "Recenzie:"
    },
    actions: {
      apply: "Registrácia",
      addToCart: "Do košíka"
    },
    labels: {
      beginner: "Začiatočník",
      intermediate: "Pokročilý",
      advanced: "Expert",
      intensive: "Intenzívna",
      soon: "Čoskoro",
      groupTraining: "Skupinové",
      privateTraining: "Súkromné",
      price: "Cena"
    }
  },
  de: {
    heroTitle: "Schulungen",
    sectionTitle: "Unsere Kurse:",
    levels: {
      basic: { name: "Himalaya Klangschalenmassage® - Anfänger", desc: "Theorie und Praxis" },
      intermediate: { name: "Himalaya Klangschalenmassage® - Fortgeschrittene", desc: "Theorie und Praxis" },
      advanced: { name: "Himalaya Klangschalenmassage® - Experte", desc: "Theorie und Praxis" },
      intensive: { name: "Intensiv", desc: "Kombiniertes Training" },
      tuningFork: { name: "Vibrationstherapie Stimmgabel", comingSoon: "Demnächst..." }
    },
    details: {
      whoIsItFor: "Für wen ist diese Schulung gedacht?",
      whoIsNotItFor: "Für wen ist diese Schulung NICHT gedacht?",
      philosophy: "Die HangAkadémia® Philosophie",
      whatYouGet: "Was erhalten Sie in unseren Schulungen?",
      whyLongTerm: "Warum ist diese Schulung langfristig tragfähig?",
      importantInfo: "Wichtige Informationen zur Schulung:",
      legal: "Rechtliche und Datenschutzinformationen",
      payment: "Zahlung",
      reviews: "Bewertungen:"
    },
    actions: {
      apply: "Registrierung",
      addToCart: "In den Warenkorb"
    },
    labels: {
      beginner: "Anfänger",
      intermediate: "Fortgeschrittene",
      advanced: "Experte",
      intensive: "Intensiv",
      soon: "Demnächst",
      groupTraining: "Gruppentraining",
      privateTraining: "Privatunterricht",
      price: "Gebühr"
    }
  }
};

interface Training {
  id: string;
  level: string;
  type: string;
  priceHuf: number;
  datesHu: string | null;
  datesEn: string | null;
  datesSk: string | null;
  locationHu: string | null;
  locationEn: string | null;
  locationSk: string | null;
}

// Assuming LevelContent is defined elsewhere or will be defined.
// For the purpose of this edit, we'll keep the OktatasokClient signature as is,
// and ensure `t` is correctly derived within it.
// The user's provided LevelContent snippet seems to be a mix-up and is not fully present in the original code.
// We will only apply the changes relevant to OktatasokClient and the dict.
export function OktatasokClient({ trainings }: { trainings: Training[] }) {
  const { language: lang } = useLanguage();
  const t = dict[lang] || dict.hu;

  const getFilteredTrainings = (level: string, type: string) => {
    return trainings.filter(tr => tr.level === level && tr.type === type);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-[25vh] md:h-[40vh] flex items-center justify-center overflow-hidden bg-brand-brown">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image 
            src="/images/rolam-hero.jpg" 
            alt="Hangakadémia" 
            fill 
            className="object-cover" 
            priority
          />
        </div>
        <div className="relative z-20 text-center px-4">
          <h1 className="font-cormorant text-4xl md:text-7xl text-white font-bold tracking-[0.2em] uppercase drop-shadow-lg">
            {t.heroTitle}
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24 bg-[#fdfaf6]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <Image src="/assets/PalAdri-logo-stroke.svg" alt="Logo" width={96} height={48} className="h-12 w-auto opacity-30" />
            </div>
            <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold uppercase tracking-widest">
              {t.sectionTitle}
            </h2>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="flex flex-wrap h-auto bg-transparent p-0 gap-2 mb-12 justify-center border-b border-brand-bronze/10 pb-8">
              <TabsTrigger value="basic" className="flex flex-col items-center py-4 px-6 rounded-xl border-2 border-brand-bronze/10 data-[state=active]:border-brand-bronze data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all group">
                <span className="text-[10px] uppercase tracking-widest text-brand-bronze/60 group-data-[state=active]:text-brand-bronze font-bold mb-1">{t.labels.beginner}</span>
                <span className="font-cormorant font-bold text-lg md:text-xl text-brand-brown">Himalájai Hangtálmasszázs®</span>
              </TabsTrigger>
              <TabsTrigger value="intermediate" className="flex flex-col items-center py-4 px-6 rounded-xl border-2 border-brand-bronze/10 data-[state=active]:border-brand-bronze data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all group">
                <span className="text-[10px] uppercase tracking-widest text-brand-bronze/60 group-data-[state=active]:text-brand-bronze font-bold mb-1">{t.labels.intermediate}</span>
                <span className="font-cormorant font-bold text-lg md:text-xl text-brand-brown">Himalájai Hangtálmasszázs®</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex flex-col items-center py-4 px-6 rounded-xl border-2 border-brand-bronze/10 data-[state=active]:border-brand-bronze data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all group">
                <span className="text-[10px] uppercase tracking-widest text-brand-bronze/60 group-data-[state=active]:text-brand-bronze font-bold mb-1">{t.labels.advanced}</span>
                <span className="font-cormorant font-bold text-lg md:text-xl text-brand-brown">Himalájai Hangtálmasszázs®</span>
              </TabsTrigger>
              <TabsTrigger value="intensive" className="flex flex-col items-center py-4 px-6 rounded-xl border-2 border-brand-bronze/10 data-[state=active]:border-brand-bronze data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all group">
                <span className="text-[10px] uppercase tracking-widest text-brand-bronze/60 group-data-[state=active]:text-brand-bronze font-bold mb-1">{t.labels.intensive}</span>
                <span className="font-cormorant font-bold text-lg md:text-xl text-brand-brown">Himalájai Hangtálmasszázs®</span>
              </TabsTrigger>
              <TabsTrigger value="tuning-fork" className="flex flex-col items-center py-4 px-6 rounded-xl border-2 border-brand-bronze/10 data-[state=active]:border-brand-bronze data-[state=active]:bg-white data-[state=active]:shadow-lg opacity-60 hover:opacity-100 transition-all group">
                <span className="text-[10px] uppercase tracking-widest text-brand-bronze/60 group-data-[state=active]:text-brand-bronze font-bold mb-1">{t.labels.soon}</span>
                <span className="font-cormorant font-bold text-lg md:text-xl text-brand-brown">{t.levels.tuningFork.name}</span>
              </TabsTrigger>
            </TabsList>

            {/* Level Contents */}
            {(['basic', 'intermediate', 'advanced', 'intensive'] as const).map((level) => (
              <TabsContent key={level} value={level}>
                <LevelContent 
                  level={level}
                  title={t.levels[level].name}
                  desc={t.levels[level].desc}
                  groupLabel={t.labels.groupTraining}
                  privateLabel={t.labels.privateTraining}
                  groupTrainings={getFilteredTrainings(level, "group")}
                  privateTrainings={getFilteredTrainings(level, "private")}
                  applyText={t.actions.apply}
                  addToCartText={t.actions.addToCart}
                  priceLabel={t.labels.price}
                  lang={lang}
                />
              </TabsContent>
            ))}

            <TabsContent value="tuning-fork">
               <div className="py-20 text-center">
                 <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-bronze/10 text-brand-bronze mb-8">
                    <ArrowRight className="w-10 h-10" />
                 </div>
                 <h3 className="font-cormorant text-3xl font-bold text-brand-brown mb-4 uppercase tracking-widest">{t.levels.tuningFork.name}</h3>
                 <p className="text-brand-black/60 font-montserrat italic">{t.levels.tuningFork.comingSoon}</p>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Who is it for Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold uppercase tracking-widest mb-8">
              Himalájai Hangtálmasszázs® képzések
            </h2>
            <p className="font-montserrat text-lg text-brand-black/70 italic max-w-3xl mx-auto mb-12">
              Strukturált technikák, amelyeket érteni és érezni is megtanulsz – amikor a technika mögött megérted a hang teljes működését.
            </p>
            <p className="text-brand-black/60 leading-relaxed max-w-3xl mx-auto">
              Sokan használnak hangtálాలను, de kevesen tanulják meg rendszerben, pontos technikákkal és tudatos figyelemmel alkalmazni őket a testen és a testen kívül.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-[#fdfaf6] p-10 rounded-3xl border border-brand-bronze/10">
              <h3 className="font-cormorant text-2xl font-bold text-brand-brown mb-6 uppercase tracking-widest flex items-center gap-3">
                <Check className="w-6 h-6 text-brand-bronze" />
                {t.details.whoIsItFor}
              </h3>
              <ul className="space-y-4">
                {[ 
                  "szeretnél biztos, strukturált hangtálas technikákat elsajátítani",
                  "fontos számodra, hogy tudd, mit csinálsz a testen és a testen kívül",
                  "nem kész recepteket keresel, hanem érteni és érzékelni szeretnéd a folyamatokat",
                  "szalutogenetikus megközelítés – az egészségforrások támogatása kerül előtérbe",
                  "felelősen, tudatosan szeretnél hanggal dolgozni",
                  "hosszú távon is hiteles, vállalható szakmai alapokat keresel"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-black/70">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-bronze shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-brand-bronze/10">
              <h3 className="font-cormorant text-2xl font-bold text-brand-brown mb-6 uppercase tracking-widest flex items-center gap-3">
                <Info className="w-6 h-6 text-brand-bronze" />
                {t.details.whoIsNotItFor}
              </h3>
              <ul className="space-y-4">
                {[
                  "gyors gyógyulást vagy kész „megoldásokat” vársz",
                  "betegségekre szeretnél ígéreteket kapni és adni",
                  "kizárólag recepteket keresel gondolkodás nélkül",
                  "nem szeretnél időt és figyelmet szánni a pontos tanulásra"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brand-black/60">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold uppercase tracking-widest mb-6">{t.details.philosophy}</h2>
            <p className="text-brand-black/70 italic max-w-3xl mx-auto">A HangAkadémia® képzési rendszere tapasztalatra épülő, rendszerezett, átgondolt tanulási folyamat, ahol a figyelem, az érzékelés és a szakmai pontosság fontosabb, mint a hangos ígéretek.</p>
          </div>
        </div>
      </section>

      {/* What you get Section */}
      <section className="py-20 bg-[#fdfaf6]">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold text-center uppercase tracking-widest mb-12">{t.details.whatYouGet}</h2>
          <p className="text-center text-brand-black/60 mb-12 max-w-2xl mx-auto">A képzések során logikus szerkezetű, összefüggő egymásra épülő, gyakorlatban alkalmazható hangtálas technikákat tanulsz.</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              { title: "Himalájai hangtálmasszázs® technikák", items: ["pontos elhelyezések, megszólaltatási módok, testhelyzetek", "testen és testen kívüli alkalmazás"] },
              { title: "Hangtan és rezgésalapok", items: ["a hang terjedése és változásai a testen"] },
              { title: "Hanganalízis™ (Sound Scan™) alapjai", items: ["hangminőség megfigyelése", "hallás és érzékelés fejlesztése", "technikai döntések támogatása"] },
              { title: "Biztonságos alkalmazási keretek", items: ["szakmai jelenlét and tudatos figyelem"] },
              { title: "Gyakorlati tapasztalat", items: ["vezetett, strukturált gyakorlás", "szakmai visszajelzés"] },
              { title: "Fokozatos építkezés", items: ["biztos alapok kialakítása"] }
            ].map((box, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-brand-bronze/5">
                <h4 className="font-bold text-brand-brown mb-4 uppercase text-xs tracking-widest">{box.title}</h4>
                <ul className="space-y-2">
                  {box.items.map((it, j) => (
                    <li key={j} className="text-xs text-brand-black/60 flex items-start gap-2">
                      <Check className="w-3 h-3 text-brand-bronze mt-0.5" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h3 className="font-cormorant text-2xl font-bold text-brand-brown mb-6">{t.details.whyLongTerm}</h3>
            <ul className="inline-flex flex-wrap justify-center gap-6 text-sm text-brand-black/70 mb-8">
              {[ 
                "tapasztalatra és megfigyelésre épül, nem hiedelmekre",
                "világos szakmai kereteket ad",
                "nem ígér olyat, amit később nehéz lenne felvállalni",
                "olyan alapokat teremt, amelyekre biztonságosan lehet továbbépíteni"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-bronze" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="font-montserrat text-lg italic text-brand-brown font-bold max-w-2xl mx-auto">
              &quot;A hanggal való munka nem attól hiteles, amit ígérünk, hanem attól, amit hosszú távon is fel tudunk vállalni.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Legal & Important info Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-16">
            <h2 className="font-cormorant text-3xl font-bold text-brand-brown text-center uppercase tracking-widest mb-10">{t.details.importantInfo}</h2>
            <div className="bg-[#fcf8f3] p-8 md:p-12 rounded-[40px] border border-brand-bronze/10 text-brand-black/70 text-sm leading-relaxed space-y-6">
              <p>Minimális létszám: A képzés <strong>minimum 3 fő jelentkezése esetén indul.</strong> Amennyiben a minimális létszám nem teljesül, a képzés új időpontban kerül meghirdetésre, vagy a befizetett összegek visszatérítésre kerülnek.</p>
              <p>A képzés államilag bejelentett, nyilvántartott felnőttképzés, nyilvántartási száma: <strong>B/2022/000274.</strong></p>
              <p>A képzés és a sikeres vizsga elvégzését követően a résztvevők a FAR-ból kiállított magyar nyelvű tanúsítványt és a HangAkadémia® által kiállított dísztanúsítványt kapnak.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="font-cormorant text-2xl font-bold text-brand-brown uppercase tracking-widest mb-6 border-b border-brand-bronze/10 pb-4">{t.details.legal}</h3>
              <div className="text-xs text-brand-black/60 space-y-4">
                <p>A képzésre történő jelentkezés előszerződésnek minősül. Az adatkezelés a hatályos GDPR előírásoknak megfelelően történik.</p>
                <p className="font-bold">
                  A tananyag bármilyen formában történő sokszorosítása, átdolgozása, átírása, digitalizálása, oktatási vagy továbbképzési célú felhasználása a jogosult előzetes írásos engedélye nélkül tilos.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-bold text-brand-brown uppercase tracking-widest mb-6 border-b border-brand-bronze/10 pb-4">{t.details.payment}</h3>
              <div className="text-xs text-brand-black/60 space-y-4">
                <p>A részvételi díj jelentkezési díjon felüli fennmaradó összege legkésőbb a képzés első napján, a helyszínen készpénzben fizetendő.</p>
                <p><strong>Bankszámla adatok:</strong><br />Pál Adrienn | CIB Bank<br />10702277-55132549-51100005</p>
                <p className="italic">Közlemény: név, képzés típusa, időpontja.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-20 text-center">
             <div className="inline-block mb-12">
                <Image src="/assets/PalAdri-logo-stroke.svg" alt="Logo" width={96} height={48} className="h-12 w-auto opacity-20 mx-auto mb-4" />
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand-black/40">© HangAkadémia® – Minden jog fenntartva.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-[#fdfaf6] overflow-hidden">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="font-cormorant text-3xl md:text-5xl text-brand-brown font-bold text-center uppercase tracking-widest mb-16">{t.details.reviews}</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                 { name: "Dóra", text: "Szeretném kifejezni mély hálámat, fantasztikus élmény volt, és úgy érzem, hogy újra feltöltődtem és kiegyensúlyozottabb lettem a hangtálterápiától." },
                 { name: "Nagy Anita", text: "Az általad nyújtott hangtálmasszázs valódi csodát tett velem. A rezgések és gyengéd hangok együttese teljesen ellazított." },
                 { name: "Csaba", text: "Sajnos krónikus alvászavarral küzdők, nagyon rossz alvó vagyok. A kezelés utáni éjszaka 6 órán át aludtam, megszakítás nélkül." }
               ].map((rev, i) => (
                 <Card key={i} className="bg-white/50 backdrop-blur shadow-sm border-brand-bronze/10 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-10 h-10 rounded-full bg-brand-bronze/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-brand-bronze" />
                       </div>
                       <span className="font-bold text-brand-brown">„{rev.name}”</span>
                    </div>
                    <p className="text-sm text-brand-black/70 italic leading-relaxed">„{rev.text}”</p>
                 </Card>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
}

const levelDetails: Record<string, { includes: string[]; syllabusTitle: string; syllabus: string[]; footerText?: string }> = {
  basic: {
    includes: [
      "elméleti, gyakorlati ismereteket",
      "A képzés ideje alatt minden hangszer biztosított. (Amennyiben már rendelkezel saját hangtállal, kérjük, hozd magaddal – ez a pontos használat és a frekvenciamérés szempontjából előnyös lehet.)",
      "eszközhasználat, melyek közül egy Meinl Sonic Energy 250g Hangtál + ütő a résztvevőé lesz",
      "oktatási segédanyagokat",
      "írásos jegyzet",
      "kiváló vizsga után tanúsítványt",
      "konzultáció lehetőség vagy gyakorlónap a későbbiekben",
      "részvétel utáni mentorálás",
      "kedvezményes eszközvásárlási lehetőség"
    ],
    syllabusTitle: "Biztos alapok a hanggal való felelős munkához",
    syllabus: [
      "megismerkednek a hangtálas munka alapvető kereteivel és szemléletével",
      "megtanulják a hanggal való munka biztonságos, etikus határait",
      "fejlesztik a hallásukat és a testi érzékelésüket",
      "gyakorlatban tapasztalják meg a testen és a testen kívüli hangalkalmazás alapjait",
      "megértik a hang és rezgés szerepét a relaxáció és az idegrendszeri állapotok támogatásában",
      "strukturált környezetben építik fel első, stabil hangtálas tapasztalataikat",
      "A HangAkadémia® kezdőképzése betekintést ad a csoportos hangélmények, hangfürdők és vezetett hangfolyamatok szemléletébe"
    ],
    footerText: "A kezdőképzés olyan alapokat teremt, amelyekre biztonságosan és hitelesen lehet továbbépíteni a középhaladó és haladó szinteken."
  },
  intermediate: {
    includes: [
      "elméleti, gyakorlati ismereteket",
      "A képzés ideje alatt minden hangszer biztosított.",
      "eszközhasználat, melyek közül egy Meinl Sonic Energy 500g Hangtál + dörzsfa a résztvevőé lesz",
      "oktatási segédanyagokat",
      "írásos jegyzet",
      "kiváló vizsga után tanúsítványt",
      "részvétel utáni mentorálás",
      "kedvezményes eszközvásárlási lehetőség"
    ],
    syllabusTitle: "Egyedi fejlesztés, integrált szemlélet, mélyebb összefüggések",
    syllabus: [
      "elmélyítik a hangrezgések és az idegrendszeri állapotok közötti kapcsolatok megértését",
      "megismerkednek a stressz és az érzelmi mintázatok hangalapú megközelítési lehetőségeivel",
      "fejlesztik az összetettebb hangtér-érzékelést és a hangok közötti viszonyok felismerését",
      "strukturált módon dolgoznak a testen és a testen kívüli hangalkalmazás összetettebb formáival",
      "megtanulják, hogyan lehet a hanggal való munkát különböző élethelyzetekhez igazítani",
      "bővítik a csoportos hangélmények, hangfürdők és vezetett hangfolyamatok vezetéséhez szükséges kompetenciáikat"
    ]
  },
  advanced: {
    includes: [
      "elméleti, gyakorlati ismereteket",
      "A képzés ideje alatt minden hangszer biztosított.",
      "eszközhasználat, melyek közül egy Meinl Sonic Energy 700g Hangtál + tál-“tartó” a résztvevőé lesz",
      "oktatási segédanyagokat",
      "írásos jegyzet",
      "kiváló vizsga után tanúsítványt",
      "részvétel utáni mentorálás",
      "kedvezményes eszközvásárlási lehetőség"
    ],
    syllabusTitle: "Rendszerszintű integráció, komplex hangtér",
    syllabus: [
      "rendszerszinten dolgoznak a test energetikai és szabályozó folyamataival",
      "elmélyítik a keleti orvoslási modellek hangalapú értelmezését",
      "komplex hangtérben alkalmazzák a hangtálas és hangvillás megközelítéseket",
      "megismerkednek a rezgésalapú hangvillák strukturált használatának alapelveivel",
      "fejlesztik a lokális és globális fókuszú hangalkalmazás érzékelését",
      "magas szintű szakmai jelenléttel dolgoznak egyéni és csoportos hangfolyamatokban"
    ]
  },
  intensive: {
    includes: [
      "elméleti, gyakorlati ismereteket",
      "A képzés ideje alatt minden hangszer biztosított.",
      "eszközhasználat: 250g, 500g és 700g Meinl Sonic Energy hangtálak + kiegészítők",
      "oktatási segédanyagokat",
      "írásos jegyzet",
      "kiváló vizsga után tanúsítványt",
      "részvétel utáni mentorálás",
      "kedvezményes eszközvásárlási lehetőség"
    ],
    syllabusTitle: "A HangAkadémia® teljes képzési rendszerének integrált formája",
    syllabus: [
      "Kezdő szint – Stabil alapok",
      "Középhaladó szint – Integrált szemlélet és több hangszer",
      "Haladó szint – Rendszerszintű integráció",
      "6 egymást követő nap alatt foglalja magában az összes szintet",
      "Sűrített, mégis teljes értékű feldolgozás"
    ]
  }
};

function LevelContent({ 
  level, title, desc, groupLabel, privateLabel, 
  groupTrainings, privateTrainings, applyText, addToCartText, priceLabel, lang 
}: {
  level: string;
  title: string;
  desc: string;
  groupLabel: string;
  privateLabel: string;
  groupTrainings: Training[];
  privateTrainings: Training[];
  applyText: string;
  addToCartText: string;
  priceLabel: string;
  lang: string;
}) {
  const detail = levelDetails[level as keyof typeof levelDetails];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center md:text-left px-4">
        <h3 className="font-cormorant text-2xl md:text-3xl text-brand-brown font-bold mb-4 uppercase tracking-widest">{title}</h3>
        <p className="text-brand-black/60 font-montserrat italic mb-8">{desc}</p>
        
        {detail && (
          <div className="grid md:grid-cols-2 gap-12 text-left mb-12">
            <div className="bg-white p-8 rounded-3xl border border-brand-bronze/10 shadow-sm transition-all hover:shadow-md">
              <h4 className="font-bold text-brand-brown mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-bronze" />
                A képzés tartalmazza:
              </h4>
              <ul className="space-y-3">
                {detail.includes.map((item, i) => (
                  <li key={i} className="text-xs text-brand-black/70 flex items-start gap-2 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-brand-bronze shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-brand-brown/[0.02] p-8 rounded-3xl border border-brand-brown/5">
              <h4 className="font-bold text-brand-brown mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-bronze" />
                A képzés tematikája:
              </h4>
              <p className="text-xs font-bold text-brand-brown/80 mb-4 italic leading-relaxed">{detail.syllabusTitle}</p>
              <ul className="space-y-3">
                {detail.syllabus.map((item, i) => (
                  <li key={i} className="text-xs text-brand-black/60 flex items-start gap-2 leading-relaxed">
                    <div className="w-1 h-1 rounded-full bg-brand-brown/30 shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              {detail.footerText && (
                <p className="mt-6 text-[10px] text-brand-black/40 italic border-t border-brand-bronze/10 pt-4">
                  {detail.footerText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="group" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="bg-brand-bronze/5 p-1 rounded-2xl border border-brand-bronze/10 h-auto">
            <TabsTrigger value="group" className="rounded-xl px-8 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-brand-brown transition-all">
              {groupLabel}
            </TabsTrigger>
            <TabsTrigger value="private" className="rounded-xl px-8 py-2.5 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-brand-brown transition-all">
              {privateLabel}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="group">
          {groupTrainings.length > 0 ? (
            <div className="space-y-8">
              {groupTrainings.map((tr) => (
                <LevelCard key={tr.id} training={tr} title={title} typeLabel={groupLabel} applyText={applyText} addToCartText={addToCartText} priceLabel={priceLabel} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-8 bg-white rounded-3xl border border-brand-bronze/10 italic text-brand-black/40">Jelenleg nincs meghirdetett csoportos időpont.</div>
          )}
        </TabsContent>
        <TabsContent value="private">
          {privateTrainings.length > 0 ? (
            <div className="space-y-8">
              {privateTrainings.map((tr) => (
                <LevelCard key={tr.id} training={tr} title={title} typeLabel={privateLabel} applyText={applyText} addToCartText={addToCartText} priceLabel={priceLabel} lang={lang} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-8 bg-white rounded-3xl border border-brand-bronze/10 italic text-brand-black/40">Jelenleg nincs meghirdetett egyéni időpont.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LevelCard({ training, title, typeLabel, applyText, addToCartText, priceLabel, lang }: {
  training: Training;
  title: string;
  typeLabel: string;
  applyText: string;
  addToCartText: string;
  priceLabel: string;
  lang: string;
}) {
  const dates = lang === 'hu' ? training.datesHu : lang === 'en' ? training.datesEn : training.datesSk;
  const location = lang === 'hu' ? training.locationHu : lang === 'en' ? training.locationEn : training.locationSk;

  return (
    <Card className="border-brand-bronze/20 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex-1">
            <Badge className="bg-brand-bronze/10 text-brand-bronze border-none mb-4 uppercase tracking-[0.2em] font-bold py-1 px-3">
              {typeLabel}
            </Badge>
            <h3 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold mb-4">{title}</h3>
            
            <div className="space-y-4 text-brand-black/70 font-montserrat text-sm leading-relaxed mb-8">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-brand-bronze" />
                <span>{dates || "Dátum egyeztetés szerint"}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-bronze" />
                <span>{location || "1188 Budapest, Nemes u. 88."}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-brand-brown p-8 rounded-3xl text-white text-center min-w-[240px] shadow-2xl relative overflow-hidden group">
            <p className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2 font-bold">{priceLabel}</p>
            <div className="text-4xl font-bold font-cormorant mb-6">{training.priceHuf.toLocaleString('hu-HU')} Ft</div>
            <Button className="w-full bg-white text-brand-brown hover:bg-brand-lightbg font-bold tracking-widest uppercase flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              {addToCartText}
            </Button>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-brand-bronze/10">
          <Link href="https://forms.gle/LMXTeJyAZ6MkKVGr9" target="_blank" className="inline-flex items-center text-brand-bronze font-bold uppercase tracking-widest text-sm hover:text-brand-brown group transition-colors">
            {applyText}
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
