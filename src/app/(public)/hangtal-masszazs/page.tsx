'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { Play, CheckCircle, Fingerprint, Waves, Sparkles } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

export default function HimalayanMassagePage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    section1_title: string;
    section1_subtitle: string;
    section1_text: string;
    section1_list: string[];
    section1_footer: string;
    section2_title: string;
    section2_subtitle: string;
    section2_list: string[];
    section2_footer: string;
    video_title: string;
    evidence_text: string;
    evidence_before: string;
    evidence_after: string;
    evidence_footer: string;
    legal_notice: string;
    copyright: string;
  }> = {
    hu: {
      section1_title: "A Hangakadémia® egyedi technikája",
      section1_subtitle: "Himalájai Hangtálmasszázs® módszer",
      section1_text: "A folyamat különlegességét az a Himalájai Hangtálmasszázs® módszer adja, amelyet hosszú évek tapasztalatával, rezgésvizsgálatokkal és hangtálstruktúrák összehangolásával fejlesztettem ki. Ez a módszer nem csupán a tálak elhelyezésére vagy megszólaltatására épül: egy komplex, többdimenziós hang–mozgás–rezgés technika, amely finoman irányított rezgésáramlást hoz létre a test energiarendszerében. A módszer kizárólag a Hangakadémia® oktatási rendszerében érhető el, és olyan élményt nyújt:",
      section1_list: [
        "amelyben a hangok fokozatosan építik fel a rezgésteret,",
        "a duplex és triplex hangtálak rezgéskapui megnyitják a mélyebb rétegeket,",
        "a rezgésmező irányított hullámokra tagolódik a test körül,",
        "és létrejön az a sajátos “lebegő állapot”, ami a módszerre jellemző."
      ],
      section1_footer: "Ez a technika nem másolható, nem utánzásra épül, és nem az általános hangtálmasszázsok módszereit követi — ez a Hangakadémia® védjegyes megközelítése, amely egyedülálló mélységet és finomságot képvisel.\n\nA hangtálak kiválasztása, összehangolása és rezgésdinamikája minden esetben személyre szabott. A hangzás így tökéletesen illeszkedik ahhoz, hogy a résztvevő számára a lehető legmélyebb harmónia, biztonság és ellazultság jöjjön létre.",
      section2_title: "Mi teszi egyedivé a Himalájai Hangtálmasszázs® módszerét?",
      section2_subtitle: "Érintéssel finoman támogatott hang-alapú testmunka",
      section2_list: [
        "a hangtálak nem csak megszólalnak,",
        "hanem a testtel és az energiarendszerrel finom, vezetett kapcsolódást hoznak létre,",
        "a kéz és a hangtál együtt dolgozik,",
        "a rezgések iránya, mélysége és ritmusa személyre szabott,",
        "a test felszínén, hangtálon keresztül adott finom érintések mély belső ellazulást hoznak,",
        "a technika lépései, rezgésstruktúrái és hangtálmozdulatai a Hangakadémia® saját fejlesztései."
      ],
      section2_footer: "A Himalájai Hangtálmasszázs® technikai felépítése és gyakorlati elemei a Hangakadémia® védett szakmai anyagai, és kizárólag a nálunk végzett, engedéllyel rendelkező szakemberek alkalmazhatják.",
      video_title: "Dr. Ketskés Norbert - A Hangrezgések hatása sejtjeinkre \"TV2\"",
      evidence_text: "Himalájai Hangtálmasszázs® Csúsztatásos technika®-jával kifejlesztett metodika alapján mutatható ki.",
      evidence_before: "előtte",
      evidence_after: "utána",
      evidence_footer: "Az itt látható vizsgálati eredmény a Hangakadémia®, a Himalájai Hangtálmasszázs® Csúsztatásos technika®-jával kifejlesztett metodika alapján mutatható ki. Megfelelő mennyiségű, minőségű és bemért frekvenciájú hangtálakkal.",
      legal_notice: "HangAkadémia® - Jogi nyilatkozat",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll."
    },
    en: {
      section1_title: "A unique technique of Hangakadémia®",
      section1_subtitle: "Himalayan Singing Bowl Massage® method",
      section1_text: "The specialty of the process is the Himalayan Singing Bowl Massage® method, which I developed through long years of experience, vibration studies, and harmonization of bowl structures. This method is not just based on placing or sounding the bowls: it's a complex, multi-dimensional sound-movement-vibration technique that creates a delicately directed flow of vibration in the body's energy system. The method is exclusively available in the Hangakadémia® educational system and provides an experience:",
      section1_list: [
        "where sounds gradually build up the vibration space,",
        "vibration gates of duplex and triplex bowls open deeper layers,",
        "the vibration field is divided into directed waves around the body,",
        "and that specific 'floating state' characteristic of the method is created."
      ],
      section1_footer: "This technique cannot be copied, is not based on imitation, and does not follow general singing bowl massage methods — it is the trademarked approach of Hangakadémia®, representing unique depth and subtlety.\n\nThe selection, harmonization, and vibration dynamics of the bowls are personalized in every case. The sound thus fits perfectly to create the deepest harmony, safety, and relaxation for the participant.",
      section2_title: "What makes the Himalayan Singing Bowl Massage® method unique?",
      section2_subtitle: "Sound-based bodywork gently supported by touch",
      section2_list: [
        "the bowls don't just sound,",
        "they create a delicate, guided connection with the body and energy system,",
        "the hand and the bowl work together,",
        "direction, depth, and rhythm of vibrations are personalized,",
        "delicate touches on the body surface through the bowl bring deep internal relaxation,",
        "the steps of the technique, vibration structures, and bowl movements are Hangakadémia®'s own developments."
      ],
      section2_footer: "The technical structure and practical elements of Himalayan Singing Bowl Massage® are protected professional materials of Hangakadémia®, and can only be used by licensed practitioners who graduated from us.",
      video_title: "Dr. Norbert Ketskés - Effect of Sound Vibrations on Our Cells \"TV2\"",
      evidence_text: "Demonstrated through the methodology developed with Himalayan Singing Bowl Massage® Sliding Technique®.",
      evidence_before: "before",
      evidence_after: "after",
      evidence_footer: "The examination result shown here can be demonstrated based on the methodology developed with the Hangakadémia® Himalayan Singing Bowl Massage® Sliding Technique®. With an appropriate quantity, quality, and gauged frequency of sound bowls.",
      legal_notice: "HangAkadémia® - Legal Notice",
      copyright: "© HangAkadémia® – All rights reserved. Content protected by copyright."
    },
    sk: {
      section1_title: "Jedinečná technika Hangakadémia®",
      section1_subtitle: "Metóda Himalájskej masáže spievajúcimi misami®",
      section1_text: "Výnimočnosť procesu spočíva v metóde Himalájskej masáže spievajúcimi misami®, ktorú som vyvinula počas dlhých rokov skúseností, vibračných štúdií a harmonizácie štruktúr mís. Táto metóda nie je založená len na umiestňovaní alebo zvučení mís: je to komplexná, multidimenzionálna technika zvuk–pohyb–vibrácia, ktorá vytvára jemne usmernený tok vibrácií v energetickom systéme tela. Metóda je exkluzívne dostupná vo vzdelávacom systéme Hangakadémia® a poskytuje zážitok:",
      section1_list: [
        "v ktorom zvuky postupne budujú vibračný priestor,",
        "vibračné brány duplexných a triplexných mís otvárajú hlbšie vrstvy,",
        "vibračné pole je rozdelené do usmernených vĺn okolo tela,",
        "a vzniká ten špecifický „stav vznášania sa“, ktorý je pre túto metódu typický."
      ],
      section1_footer: "Táto technika sa nedá kopírovať, nie je založená na napodobňovaní a neriadi sa všeobecnými metódami masáže spievajúcimi misami — je to ochrannou známkou chránený prístup Hangakadémia®, ktorý predstavuje jedinečnú hĺbku a jemnosť.\n\nVýber, harmonizácia a dynamika vibrácií mís sú v každom prípade personalizované. Zvuk tak dokonale ladí s tým, aby u účastníka vytvoril čo najhlbšiu harmóniu, bezpečie a uvoľnenie.",
      section2_title: "Čo robí metódu Himalájskej masáže spievajúcimi misami® jedinečnou?",
      section2_subtitle: "Zvukovo založená práca s telom jemne podporená dotykom",
      section2_list: [
        "misy nielen znejú,",
        "ale vytvárajú jemné, vedené spojenie s telom a energetickým systémom,",
        "ruka a misy pracujú spoločne,",
        "smer, hĺbka a rytmus vibrácií sú personalizované,",
        "jemné dotyky na povrchu tela cez misu prinášajú hlboké vnútorné uvoľnenie,",
        "kroky techniky, vibračné štruktúry a pohyby mís sú vlastným vývojom Hangakadémia®."
      ],
      section2_footer: "Technická štruktúra a praktické prvky Himalájskej masáže spievajúcimi misami® sú chránené odborné materiály Hangakadémia® a môžu ich používať výhradne u nás vyškolení odborníci s povolením.",
      video_title: "Dr. Norbert Ketskés - Účinok zvukových vibrácií na naše bunky \"TV2\"",
      evidence_text: "Preukázané prostredníctvom metodiky vyvinutej s kĺzavou technikou Himalájskej masáže spievajúcimi misami®.",
      evidence_before: "predtým",
      evidence_after: "potom",
      evidence_footer: "Výsledok vyšetrenia zobrazený tu možno preukázať na základe metodiky vyvinutej s kĺzavou technikou Hangakadémia® Himalájskej masáže spievajúcimi misami®. S primeraným množstvom, kvalitou a kalibrovanou frekvenciou spievajúcich mís.",
      legal_notice: "HangAkadémia® - Právne vyhlásenie",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white pb-20">
      {/* Intro Section */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
             <div className="w-24 h-24 mb-6 relative grayscale opacity-40">
                <Image src="/images/Sejtmasszazs-ico.webp" alt="Icon" fill className="object-contain" />
             </div>
             <h2 className="font-montserrat text-sm uppercase tracking-widest text-brand-bronze font-semibold mb-4">
               {t.section1_title}
             </h2>
             <h3 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold tracking-tight mb-10">
               {t.section1_subtitle}
             </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
             <div className="space-y-8">
               <p className="font-playfair text-xl text-brand-black/80 leading-relaxed italic">
                 {t.section1_text}
               </p>
               <div className="grid grid-cols-1 gap-4">
                 {t.section1_list.map((item, index) => (
                   <div key={index} className="flex gap-4 items-start bg-brand-lightbg p-6 rounded-2xl border border-brand-bronze/5">
                      <CheckCircle className="text-brand-bronze shrink-0 mt-1" size={20} />
                      <p className="font-montserrat text-sm text-brand-black/70 leading-relaxed">
                        {item}
                      </p>
                   </div>
                 ))}
               </div>
             </div>
             <div className="space-y-8 bg-brand-bronze/5 p-10 rounded-[3rem] border border-brand-bronze/10">
               <Fingerprint className="text-brand-bronze mb-6 opacity-30" size={48} />
               <p className="font-montserrat text-base text-brand-black/70 leading-relaxed whitespace-pre-line">
                 {t.section1_footer}
               </p>
             </div>
          </div>
        </div>
      </section>

      {/* Uniqueness Section */}
      <section className="py-24 bg-brand-lightbg px-4 rounded-[4rem] mx-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="font-cormorant text-4xl text-brand-brown font-bold mb-6">
               {t.section2_title}
             </h2>
             <p className="font-playfair text-xl text-brand-bronze italic">
               {t.section2_subtitle}
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {t.section2_list.map((item, index) => (
              <div key={index} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-brand-bronze/5 group hover:bg-white transition-all duration-300">
                 <div className="w-2 h-2 rounded-full bg-brand-bronze group-hover:scale-150 transition-transform"></div>
                 <p className="font-montserrat text-sm text-brand-black/80">
                   {item}
                 </p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="font-montserrat text-sm text-brand-black/60 leading-relaxed">
              {t.section2_footer}
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-24 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer aspect-video max-w-4xl mx-auto">
            <Image src="/images/Video-01.webp" alt="Video Thumbnail" fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <a href="https://youtu.be/vrj6jAPQdac" target="_blank" className="absolute inset-0 flex items-center justify-center">
               <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center text-brand-brown shadow-xl group-hover:scale-110 transition-transform">
                  <Play fill="currentColor" size={40} />
               </div>
            </a>
            <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center text-center text-white drop-shadow-lg">
               <Sparkles className="mb-4 opacity-50" />
               <p className="font-montserrat font-bold text-lg">
                 {t.video_title}
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Section */}
      <section className="py-24 bg-white px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
             <Waves className="text-brand-bronze mb-8 animate-pulse" size={60} />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 w-full max-w-4xl">
                <div className="space-y-4">
                   <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                      <Image src="/images/sejt_elotte.webp" alt="Before" fill className="object-cover" />
                   </div>
                   <p className="font-montserrat uppercase tracking-widest text-brand-black/40 text-sm font-bold">
                     {t.evidence_before}
                   </p>
                </div>
                <div className="space-y-4">
                   <div className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white">
                      <Image src="/images/sejt_utana.webp" alt="After" fill className="object-cover" />
                   </div>
                   <p className="font-montserrat uppercase tracking-widest text-brand-bronze text-sm font-bold">
                     {t.evidence_after}
                   </p>
                </div>
             </div>
             <p className="font-montserrat text-sm text-brand-black/60 max-w-3xl leading-relaxed">
                {t.evidence_footer}
             </p>
          </div>
        </div>
      </section>

      <LegalSection />
    </div>
  );
}
