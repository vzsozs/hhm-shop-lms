'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { CheckCircle2, History, HeartPulse, Scroll } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

export default function SoundTherapyPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    section1_title: string;
    section1_text: string;
    section2_title: string;
    section2_text: string;
    section3_title: string;
    section3_items: string[];
    section3_footer: string;
    legal_notice: string;
    copyright: string;
  }> = {
    hu: {
      section1_title: "Hangalapú, rezgésorientált megközelítés történeti és kortárs kontextusban",
      section1_text: "A hangterápia olyan hangalapú, rezgésorientált megközelítések összefoglaló megnevezése, amelyek a hang érzékelésen keresztüli hatásait használják a testi és mentális állapotok támogatására. A hangterápia a komplementer szemléletű módszerek körébe tartozik, és nem helyettesíti az orvosi vagy pszichológiai ellátást; elsősorban kísérő, támogató, prevenciós és önszabályozást segítő gyakorlatként jelenik meg.\n\nA HangAkadémia® szemléletében a hangterápia tudatos hanghasználat, amely az emberi test természetes rezonanciakészségére és a figyelmi jelenlétre épít, az egészségügyi és etikai határok tiszteletben tartásával.",
      section2_title: "A hangtálak történeti háttere és kulturális eredete",
      section2_text: "A hangtálak, nemzetközi nevükön singing bowls, pontos eredete nem köthető egyetlen forráshoz vagy korszakhoz, azonban régészeti, metallurgiai és néprajzi adatok alapján több ezer éves múltra tekintenek vissza.\n\nA legkorábbi, hangtálakhoz hasonló rezonáns fémtárgyak az ókori Perzsia területéről, különösen a történelmi Khoraszan régióból származnak. Ezek a kezdetben rituális, háztartási vagy ceremoniális célú fém edények idővel olyan formát és anyagminőséget nyertek, amelyek hangképzésre is alkalmassá váltak.\n\nA fémmegmunkálás tudása a kereskedelmi és kulturális útvonalakon keresztül fokozatosan jutott el a Himalája térségébe, ahol a hangtálkészítés technikája helyi hagyományokkal és spirituális gyakorlatokkal kapcsolódott össze.\n\nA ma ismert „himalájai hangtál” megnevezés nem egyetlen kultúrát, hanem egy hosszú, több régión átívelő fejlődési folyamat eredményét jelöli.\n\nNapjainkban a legnagyobb szakmai megbecsülésnek örvendő hangtálakat továbbra is a himalájai régióban – elsősorban Nepálban és Észak-Indiában – készítik, kézműves mesterek, hagyományos technikákkal.",
      section3_title: "A hangterápia helye a komplementer szemléletben",
      section3_items: [
        "holisztikus szemlélet – a testi, idegrendszeri és mentális folyamatok összefüggéseiben gondolkodik",
        "dinamikus egészségfelfogás – az egyensúly folyamatosan alakuló állapot",
        "individuális, személyre szabott hanghasználat – nincs univerzális technika vagy „általánosan érvényes” hang",
        "szalutogenetikus megközelítés – az egészségforrások támogatása kerül előtérbe",
        "tudatos kísérői jelenlét – nem diagnózis- vagy kezelésközpontú",
        "prevenció és önszabályozás támogatása – a testi érzékelés és a figyelmi jelenlét fejlesztésén keresztül"
      ],
      section3_footer: "A HangAkadémia® rendszerében a hangterápia strukturált, oktatási és etikai keretek között alkalmazott módszer, amely magas szakmai minőséget képvisel, miközben tiszteletben tartja az egészségügyi és jogi határokat.",
      legal_notice: "HangAkadémia® - Jogi nyilatkozat",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll."
    },
    en: {
      section1_title: "Sound-based, vibration-oriented approach in historical and contemporary contexts",
      section1_text: "Sound therapy is a collective term for sound-based, vibration-oriented approaches that use the effects of sound through perception to support physical and mental states. Sound therapy belongs to the realm of complementary methods and does not replace medical or psychological care; it primarily appears as a concomitant, supportive, preventive, and self-regulatory practice.\n\nIn the perspective of HangAkadémia®, sound therapy is a conscious use of sound based on the human body's natural resonance capability and attentive presence, respecting health and ethical boundaries.",
      section2_title: "Historical background and cultural origin of singing bowls",
      section2_text: "Singing bowls, as they are known internationally, have exact origins that cannot be linked to a single source or era; however, based on archaeological, metallurgical, and ethnographic data, they date back thousands of years.\n\nThe earliest resonant metal objects similar to singing bowls originated from ancient Persia, particularly the historical Khorasan region. These metal vessels, initially intended for ritual, household, or ceremonial purposes, eventually gained shapes and material qualities suitable for sound production.\n\nKnowledge of metalworking gradually reached the Himalayan region through trade and cultural routes, where the technique of making singing bowls combined with local traditions and spiritual practices.\n\nThe term 'Himalayan singing bowl' as known today does not denote a single culture but the result of a long developmental process spanning several regions.\n\nToday, the most professionally esteemed singing bowls continue to be made in the Himalayan region – primarily in Nepal and North India – by artisans using traditional techniques.",
      section3_title: "The role of sound therapy in complementary approaches",
      section3_items: [
        "holistic view – considers body, nervous system, and mental processes in their interconnections",
        "dynamic concept of health – balance is a continuously evolving state",
        "individual, personalized use of sound – there is no universal technique or 'generally valid' sound",
        "salutogenetic approach – emphasizes supporting health resources",
        "conscious presence of the practitioner – not focused on diagnosis or treatment",
        "prevention and support of self-regulation – through the development of physical perception and attentive presence"
      ],
      section3_footer: "In the HangAkadémia® system, sound therapy is a method applied within structured educational and ethical frameworks, representing high professional quality while respecting health and legal boundaries.",
      legal_notice: "HangAkadémia® - Legal Notice",
      copyright: "© HangAkadémia® – All rights reserved. Content protected by copyright."
    },
    sk: {
      section1_title: "Zvukovo založený, na vibrácie orientovaný prístup v historickom a súčasnom kontexte",
      section1_text: "Zvuková terapia je súhrnný názov pre zvukovo založené prístupy orientované na vibrácie, ktoré využívajú účinky zvuku prostredníctvom vnímania na podporu fyzických a duševných stavov. Zvuková terapia patrí do oblasti komplementárnych metód a nenahrádza lekársku alebo psychologickú starostlivosť; objavuje sa predovšetkým ako sprevádzajúca, podporná, preventívna prax a prax pomáhajúca samoregulácii.\n\nV perspektíve HangAkadémia® je zvuková terapia vedomým používaním zvuku, ktoré stavia na prirodzenej schopnosti rezonancie ľudského tela a pozornej prítomnosti, rešpektujúc zdravotné a etické hranice.",
      section2_title: "Historické pozadie a kultúrny pôvod spievajúcich mís",
      section2_text: "Spievajúce misy, medzinárodne známe ako singing bowls, majú presný pôvod, ktorý nemožno spojiť s jediným zdrojom alebo érou; na základe archeologických, metalurgických a etnografických údajov sa však datujú tisíce rokov dozadu.\n\nNajstaršie rezonančné kovové predmety podobné spievajúcim misám pochádzajú z antickej Perzie, konkrétne z historického regiónu Chorasán. Tieto kovové nádoby, pôvodne určené na rituálne, domáce alebo ceremoniálne účely, časom získali tvary a kvality materiálu vhodné na produkciu zvuku.\n\nZnalosti o spracovaní kovov sa postupne dostali do himalájskeho regiónu prostredníctvom obchodných a kultúrnych ciest, kde sa technika výroby spievajúcich mís spojila s miestnymi tradíciami a duchovnými praktikami.\n\nTermín „himalájska spievajúca misa“, ako ho poznáme dnes, neoznačuje jednu kultúru, ale výsledok dlhého procesu vývoja prebiehajúceho vo viacerých regiónoch.\n\nDnes sa najvýznamnejšie spievajúce misy naďalej vyrábajú v himalájskom regióne – predovšetkým v Nepále a severnej Indii – remeselníkmi používajúcimi tradičné techniky.",
      section3_title: "Úloha zvukovej terapie v komplementárnych prístupoch",
      section3_items: [
        "holistický pohľad – zvažuje telesné, nervové a duševné procesy v ich vzájomnom prepojení",
        "dynamický koncept zdravia – rovnováha je neustále sa vyvíjajúci stav",
        "individuálne, personalizované používanie zvuku – neexistuje univerzálna technika ani „všeobecne platný“ zvuk",
        "salutogenetický prístup – kladie dôraz na podporu zdrojov zdravia",
        "vedomá prítomnosť terapeuta – nezameriava sa na diagnózu alebo liečbu",
        "prevencia a podpora samoregulácie – prostredníctvom rozvoja fyzického vnímania a pozornej prítomnosti"
      ],
      section3_footer: "V systéme HangAkadémia® je zvuková terapia metódou aplikovanou v rámci štruktúrovaných vzdelávacích a etických rámcov, predstavujúcou vysokú odbornú kvalitu pri rešpektovaní zdravotných a právnych hraníc.",
      legal_notice: "HangAkadémia® - Právne vyhlásenie",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Hero Section with stacked images */}
      <section className="relative pt-10 pb-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="relative h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl group">
               <Image 
                 src="/images/hangtalmasszazs-03.webp" 
                 alt="Sound Therapy 1" 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-700" 
               />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
            <div className="relative h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-2xl group">
               <Image 
                 src="/images/hangtalmasszazs-01.webp" 
                 alt="Sound Therapy 2" 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-light mb-10 tracking-tight leading-tight max-w-4xl mx-auto">
              {t.section1_title}
            </h2>
          </div>
        </div>
      </section>

      {/* Definition Section */}
      <section className="py-20 bg-brand-lightbg px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-sm border border-brand-bronze/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 text-brand-bronze/10">
               <HeartPulse size={120} />
             </div>
             <p className="font-playfair text-xl md:text-2xl text-brand-black/80 leading-relaxed whitespace-pre-line relative z-10">
               {t.section1_text}
             </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <div className="w-full md:w-1/3">
               <div className="sticky top-32">
                 <div className="flex items-center gap-4 mb-6 text-brand-bronze">
                   <History size={32} />
                   <div className="h-px bg-brand-bronze/30 flex-grow"></div>
                 </div>
                 <h2 className="font-cormorant text-4xl text-brand-brown font-bold leading-tight">
                   {t.section2_title}
                 </h2>
                 <div className="mt-12 opacity-20">
                    <Scroll size={160} />
                 </div>
               </div>
            </div>
            <div className="w-full md:w-2/3">
               <p className="font-montserrat text-lg text-brand-black/70 leading-relaxed whitespace-pre-line">
                 {t.section2_text}
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Complementary approach icons - placeholder for mapping */}
      <section className="py-20 bg-brand-bronze/5 px-4 overflow-hidden">
        <div className="container max-w-6xl mx-auto text-center">
           <div className="mb-16 relative h-40 w-full max-w-2xl mx-auto grayscale opacity-50">
             <Image src="/images/Alternativ_gyogyaszat_icons.svg" alt="Complementary Icons" fill className="object-contain" />
           </div>
           <h2 className="font-cormorant text-4xl text-brand-brown font-bold mb-12">
             {t.section3_title}
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {t.section3_items.map((item, index) => (
               <div key={index} className="bg-white p-8 rounded-3xl shadow-sm border border-brand-bronze/5 flex gap-4 text-left group hover:border-brand-bronze/20 transition-all duration-300">
                  <CheckCircle2 className="text-brand-bronze shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="font-montserrat text-sm text-brand-black/80 leading-snug">
                    {item}
                  </p>
               </div>
             ))}
           </div>
        </div>
      </section>

      <LegalSection />
    </div>
  );
}
