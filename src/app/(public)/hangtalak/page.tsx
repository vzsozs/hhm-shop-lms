'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { MapPin, Info } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

export default function HimalayanBowlsPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    section1_title: string;
    section1_text: string;
    section2_text: string;
    legal_notice: string;
    copyright: string;
  }> = {
    hu: {
      section1_title: "Miért nevezem az éneklőtálakat Himalájai hangtálaknak és nem Tibeti hangtálaknak?",
      section1_text: "Először is azt említeném meg, hogy az én hangtáljaim amivel a Himalájai hangtálmasszázs®-t végzem és a webshopomban megvásárolható összes hangtál a Himalájai régióból származik, ezért hívom őket összefoglaló néven: Himalájai hangtálaknak.\n\nAz általam forgalmazott hangtálak és hangeszközök nagyrészben Nepál, India és Kína több területéről érkeznek. Tehát a kifejezés a hangtálak eredetére utal, azaz arra a területre, ahol ezeket a hangszereket hagyományosan készítették és használták, napjainkig. A himalájai régió, különösen Nepál és Tibet területe, híres arról, hogy hosszú évszázadokon át őrzött egyedülálló kulturális és spirituális gyakorlatokat, köztük a hangtálak készítését és alkalmazását is.",
      section2_text: "A Himalájai hegység Dél-Ázsiában található. Ez a hatalmas hegylánc a kontinens északkeleti részén terül el, és átfedi több ország területét. A Himalája Indiában, Nepálban, Bhutánban, Afganisztánban, Pakisztánban és Kínában (Tibet) található. A hegység hossza mintegy 2 400 kilométer, és átlagosan mintegy 200-400 kilométer széles. A legmagasabb hegyek, beleértve a világ legmagasabb csúcsát, a Mount Everestet, a Himalája részét képezik.",
      legal_notice: "HangAkadémia® - Jogi nyilatkozat",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll."
    },
    en: {
      section1_title: "Why do I call singing bowls 'Himalayan' instead of 'Tibetan'?",
      section1_text: "First, all the singing bowls I use for Himalayan Singing Bowl Massage® and those available in my webshop originate from the Himalayan region, which is why I call them collectively: Himalayan singing bowls.\n\nThe bowls and sound instruments I distribute majorly come from various areas of Nepal, India, and China. Thus, the term refers to the origin of the singing bowls – the area where these instruments have been traditionally made and used until today. The Himalayan region, especially Nepal and Tibet, is famous for preserving unique cultural and spiritual practices for centuries, including the making and application of singing bowls.",
      section2_text: "The Himalayan mountain range is located in Southern Asia. This massive range stretches across the northeastern part of the continent, overlapping several countries. The Himalayas are found in India, Nepal, Bhutan, Afghanistan, Pakistan, and China (Tibet). The range is about 2,400 kilometers long and averages about 200-400 kilometers wide. The highest mountains, including the world's highest peak, Mount Everest, are part of the Himalayas.",
      legal_notice: "HangAkadémia® - Legal Notice",
      copyright: "© HangAkadémia® – All rights reserved. Content protected by copyright."
    },
    sk: {
      section1_title: "Prečo nazývam spievajúce misy 'Himalájskymi' a nie 'Tibetskými'?",
      section1_text: "Po prvé, všetky spievajúce misy, ktoré používam pri Himalájskej masáži spievajúcimi misami®, a tie, ktoré sú dostupné v mojom e-shope, pochádzajú z himalájskeho regiónu, a preto ich súhrnne nazývam: Himalájske spievajúce misy.\n\nMisy a zvukové nástroje, ktoré distribuujem, pochádzajú prevažne z rôznych oblastí Nepálu, Indie a Číny. Takže tento termín odkazuje na pôvod spievajúcich mís – oblasť, kde sa tieto nástroje tradične vyrábali a používali až dodnes. Himalájsky región, najmä Nepál a Tibet, je známy tým, že po stáročia uchovával jedinečné kultúrne a duchovné praktiky, vrátane výroby a aplikácie spievajúcich mís.",
      section2_text: "Himalájske pohorie sa nachádza v južnej Ázii. Tento masívny reťazec sa rozprestiera v severovýchodnej časti kontinentu a prekrýva niekoľko krajín. Himaláje sa nachádzajú v Indii, Nepále, Bhutáne, Afganistane, Pakistane a Číne (Tibet). Pohorie je dlhé približne 2 400 kilometrov a široké priemerne 200-400 kilometrov. Súčasťou Himalájí sú najvyššie hory sveta vrátane najvyššieho vrcholu Mount Everest.",
      legal_notice: "HangAkadémia® - Právne vyhlásenie",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Intro Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10 text-brand-bronze/40">
             <Info size={32} />
             <div className="h-px bg-brand-bronze/20 flex-grow"></div>
          </div>
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold mb-12 tracking-tight leading-tight">
            {t.section1_title}
          </h2>
          <div className="prose prose-brand max-w-none">
            <p className="font-playfair text-xl text-brand-black/80 leading-relaxed whitespace-pre-line">
              {t.section1_text}
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-brand-lightbg px-4 overflow-hidden">
        <div className="container max-w-6xl mx-auto">
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl mb-16 group">
            <Image 
              src="/images/Map.webp" 
              alt="Himalaya Map" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            <div className="absolute bottom-10 left-10 flex items-center gap-3 text-white">
               <MapPin size={24} className="animate-bounce" />
               <span className="font-montserrat font-bold tracking-widest uppercase">Himalayas</span>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto text-center">
            <p className="font-montserrat text-lg text-brand-black/70 leading-relaxed italic">
              {t.section2_text}
            </p>
          </div>
        </div>
      </section>

      <LegalSection />
    </div>
  );
}
