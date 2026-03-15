'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { Sun, Activity, Heart, Smile, CheckCircle2 } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

interface ApplicationArea {
  id: string;
  title: string;
  icon: any;
  items: string[];
}

export default function ApplicationAreasPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    intro: string;
    outro: string;
    copyright: string;
    reviews_title: string;
    legal_notice: string;
    areas: ApplicationArea[];
    reviews: { name: string; text: string; gender: string }[];
  }> = {
    hu: {
      intro: "A hangok pozitív hatásai különböző területeken",
      outro: "Ezek az élmények gyakran a mindennapi nyugalmi rituálék részévé válnak.",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll.",
      legal_notice: "Hangakadémia® - Jogi nyilatkozat",
      reviews_title: "Vélemények",
      areas: [
        {
          id: '1',
          title: "Pihenés & Lelki Egyensúly",
          icon: Sun,
          items: [
            "mély ellazulás",
            "befelé figyelés, elcsendesedés",
            "stresszoldó élmény",
            "meditatív állapot támogatása",
            "érzelmi kiegyensúlyozottság",
            "koncentráció mélyülése",
            "Meditáció"
          ]
        },
        {
          id: '2',
          title: "Energetikai & Mentális Frissesség",
          icon: Activity,
          items: [
            "belső egyensúly megélése",
            "jelenlét és fókusz támogatása",
            "tanulásbarát, nyugodt környezet megteremtése",
            "figyelem rendezése",
            "kreativitás előhívása",
            "intuitív érzékelés elmélyülése",
            "jobb–bal agyfélteke összehangoltság élménye",
            "energetikai tisztaságérzet"
          ]
        },
        {
          id: '3',
          title: "Közérzet & Relaxációs Jól-lét",
          icon: Heart,
          items: [
            "segítik a mélyebb kikapcsolódást",
            "megnyugtatják az idegrendszert",
            "támogatják a légzés természetes lassulását",
            "oldhatják a feszültségérzetet",
            "kellemes, belső „rezgésmasszázs” érzetet adnak",
            "segítenek ráhangolódni az esti pihenésre",
            "harmonikus légkört teremtenek felnőttek és gyermekek számára"
          ]
        },
        {
          id: '4',
          title: "Gyermekeknél is kedvelt élmény",
          icon: Smile,
          items: [
            "megnyugtató",
            "játékosan ismerős",
            "könnyen befogadható",
            "harmonikus környezetet teremt számukra"
          ]
        }
      ],
      reviews: [
        {
          name: "Dóra",
          text: "Szeretném kifejezni mély hálámat, fantasztikus élmény volt, és úgy érzem, hogy újra feltöltődtem és kiegyensúlyozottabb lettem a hangtálterápiától. Az alkalmazott technikák és hangok valóban segítettek ellazulnom és a mindennapi stressztől megszabadulni. A hangtálmasszázs nemcsak testileg, hanem lelkileg is jót tett nekem, és úgy érzem, hogy frissen és energetikusan léphetek tovább a mindennapokban.",
          gender: "woman"
        },
        {
          name: "Nagy Anita",
          text: "Az általad nyújtott hangtálmasszázs valódi csodát tett velem. A rezgések és gyengéd hangok együttese teljesen ellazított és elmerített egy olyan állapotban, amit korábban még sosem tapasztaltam. Az izmaim ellazultak, a stressz és feszültség pedig mintha elpárologott volna.",
          gender: "woman"
        },
        {
          name: "Tamás",
          text: "Teljesen más élmény volt mint egy hagyományos masszázs. Nagyon tetszett!",
          gender: "man"
        },
        {
          name: "Csaba",
          text: "Sajnos krónikus alvászavarral küzdők, nagyon rossz alvó vagyok. A kezelés utáni éjszaka 6 órán át aludtam, megszakítás nélkül. Másnap úgy éreztem mintha 2 napot aludtam volna és kipihent voltam. Nagyon hálás vagyok, köszönöm.",
          gender: "man"
        }
      ]
    },
    en: {
      intro: "Positive effects of sounds in different areas",
      outro: "These experiences often become part of daily relaxation rituals.",
      copyright: "© HangAkadémia® – All rights reserved. Content is protected by copyright.",
      legal_notice: "Hangakadémia® - Legal Notice",
      reviews_title: "Feedback",
      areas: [
        {
          id: '1',
          title: "Relaxation & Inner Balance",
          icon: Sun,
          items: [
            "deep relaxation",
            "inner focus, silencing",
            "stress-relieving experience",
            "support for meditative state",
            "emotional balance",
            "deepened concentration",
            "Meditation"
          ]
        },
        {
          id: '2',
          title: "Energetic & Mental Freshness",
          icon: Activity,
          items: [
            "experiencing inner balance",
            "support for presence and focus",
            "creating a learning-friendly, calm environment",
            "organizing attention",
            "evoking creativity",
            "deepening intuitive perception",
            "experience of left-right brain synchronization",
            "sense of energetic purity"
          ]
        },
        {
          id: '3',
          title: "Well-being & Relaxation",
          icon: Heart,
          items: [
            "help deeper relaxation",
            "calm the nervous system",
            "support natural slowing of breathing",
            "can resolve feelings of tension",
            "provide a pleasant, internal 'vibration massage' feeling",
            "help tune into evening rest",
            "create a harmonious atmosphere for both adults and children"
          ]
        },
        {
          id: '4',
          title: "Uniquely popular with children",
          icon: Smile,
          items: [
            "soothing",
            "playfully familiar",
            "easy to accept",
            "creates a harmonious environment for them"
          ]
        }
      ],
      reviews: [
        {
          name: "Dora",
          text: "I would like to express my deep gratitude, it was a fantastic experience, and I feel recharged and more balanced from the singing bowl therapy. The techniques and sounds used really helped me relax and get rid of everyday stress.",
          gender: "woman"
        },
        {
          name: "Anita Nagy",
          text: "The singing bowl massage you provided did a real miracle to me. The combination of vibrations and gentle sounds completely relaxed me and immersed me in a state I had never experienced before.",
          gender: "woman"
        },
        {
          name: "Thomas",
          text: "It was a completely different experience than a traditional massage. I liked it very much!",
          gender: "man"
        },
        {
          name: "Csaba",
          text: "Unfortunately, I suffer from chronic insomnia, I am a very poor sleeper. The night after the treatment I slept for 6 hours, without interruption. I am very grateful, thank you.",
          gender: "man"
        }
      ]
    },
    sk: {
      intro: "Pozitívne účinky zvukov v rôznych oblastiach",
      outro: "Tieto zážitky sa často stávajú súčasťou každodenných relaxačných rituálov.",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom.",
      legal_notice: "Hangakadémia® - Právne vyhlásenie",
      reviews_title: "Recenzie",
      areas: [
        {
          id: '1',
          title: "Relaxácia & Vnútorná rovnováha",
          icon: Sun,
          items: [
            "hlboké uvoľnenie",
            "vnútorné sústredenie, stíšenie",
            "zážitok uvoľňujúci stres",
            "podpora meditatívneho stavu",
            "emočná vyrovnanosť",
            "prehlbovanie koncentrácie",
            "Meditácia"
          ]
        },
        {
          id: '2',
          title: "Energetická & Mentálna sviežosť",
          icon: Activity,
          items: [
            "prežívanie vnútornej rovnováhy",
            "podpora prítomnosti a sústredenia",
            "vytvorenie pokojného prostredia priateľského k učeniu",
            "usporiadanie pozornosti",
            "vyvolanie kreativity",
            "prehlbovanie intuitívneho vnímania",
            "zážitok synchronizácie ľavej a pravej mozgovej hemisféry",
            "pocit energetickej čistoty"
          ]
        },
        {
          id: '3',
          title: "Pocit pohody & Relaxácia",
          icon: Heart,
          items: [
            "pomáhajú k hlbšiemu uvoľneniu",
            "upokojujú nervový systém",
            "podporujú prirodzené spomalenie dýchania",
            "môžu zmierniť pocit napätia",
            "poskytujú príjemný vnútorný pocit 'vibračnej masáže'",
            "pomáhajú naladiť sa na večerný odpočinok",
            "vytvárajú harmonickú atmosféru pre dospelých aj deti"
          ]
        },
        {
          id: '4',
          title: "Obľúbený zážitok aj u detí",
          icon: Smile,
          items: [
            "upokojujúce",
            "hravo známe",
            "ľahko prijateľné",
            "vytvára pre ne harmonické prostredie"
          ]
        }
      ],
      reviews: [
        {
          name: "Dóra",
          text: "Chcela by som vyjadriť svoju hlbokú vďačnosť, bol to fantastický zážitok a cítim sa po terapii spievajúcimi misami nabitá a vyrovnanejšia. Použité techniky a zvuky mi skutočne pomohli uvoľniť sa a zbaviť sa každodenného stresu.",
          gender: "woman"
        },
        {
          name: "Anita Nagy",
          text: "Masáž spievajúcimi misami, ktorú ste mi poskytli, urobila so mnou skutočný zázrak. Kombinácia vibrácií a jemných zvukov ma úplne uvoľnila a ponorila do stavu, ktorý som predtým nikdy nezažila.",
          gender: "woman"
        },
        {
          name: "Tamáš",
          text: "Bol to úplne iný zážitok ako tradičná masáž. Veľmi sa mi to páčilo!",
          gender: "man"
        },
        {
          name: "Csaba",
          text: "Bohužiaľ trpím chronickou nespavosťou, som veľmi zlý spáč. Noc po ošetrení som spal 6 hodín bez prerušenia. Som veľmi vďačný, ďakujem.",
          gender: "man"
        }
      ]
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Introduction Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-12">
            <Image src="/images/PalAdri-logo-stroke.svg" alt="Logo" width={100} height={100} className="opacity-80" />
          </div>
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold mb-16 tracking-tight">
            {t.intro}
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {t.areas.map((area) => (area && (
              <div key={area.id} className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-brand-bronze/10 text-left transition-all hover:shadow-xl hover:border-brand-bronze/30 group">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-brand-bronze/10 flex items-center justify-center text-brand-bronze group-hover:bg-brand-brown group-hover:text-white transition-colors duration-500">
                    <area.icon size={32} />
                  </div>
                  <h3 className="font-cormorant text-2xl md:text-3xl text-brand-brown font-bold group-hover:text-brand-brown transition-colors">
                    {area.title}
                  </h3>
                </div>
                <ul className="space-y-4">
                  {area.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-brand-black/70 font-playfair text-lg leading-snug">
                       <CheckCircle2 className="w-5 h-5 text-brand-bronze/40 shrink-0 mt-1" />
                       {item}
                    </li>
                  ))}
                </ul>
              </div>
            )))}
          </div>

          <p className="font-cormorant text-2xl md:text-3xl text-brand-bronze italic max-w-3xl mx-auto leading-relaxed">
            &quot;{t.outro}&quot;
          </p>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-brand-lightbg/30">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold italic mb-4">
              {t.reviews_title}
            </h2>
            <div className="w-16 h-1 bg-brand-bronze/20 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {t.reviews.map((review, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm p-8 md:p-10 rounded-3xl border border-brand-bronze/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                 <div className="absolute -top-4 -right-2 text-brand-bronze/5 font-serif text-[12rem] leading-none pointer-events-none group-hover:text-brand-bronze/10 transition-colors">”</div>
                 <p className="text-brand-black/80 font-playfair text-lg italic leading-relaxed mb-8 relative z-10">
                   „{review.text}”
                 </p>
                 <div className="flex items-center gap-4 relative z-10">
                   <div className="w-12 h-12 rounded-full bg-brand-bronze/10 flex items-center justify-center border border-brand-bronze/20 text-brand-bronze font-bold text-lg">
                     {review.name[0]}
                   </div>
                   <div className="font-cormorant font-bold text-xl text-brand-brown">
                     „{review.name}”
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LegalSection />
    </div>
  );
}
