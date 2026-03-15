'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { Activity, Brain, Zap, Waves, ThermometerSun } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

export default function ScientificFoundationsPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    section1_title: string;
    section1_text: string;
    section1_labels: string[];
    section2_title: string;
    section2_text: string;
    section2_labels: string[];
    fascia_label: string;
    autonomic_label: string;
    legal_title: string;
    legal_text: string;
  }> = {
    hu: {
      section1_title: "Fizikai és élettani háttér",
      section1_text: "A hangterápia fizikai és élettani alapjai az akusztika, a rezgésfizika és a neurofiziológia területeihez kapcsolódnak.\n\nA hangrezgések érzékelése és feldolgozása a testen és az idegrendszeren keresztül történik, és különféle fiziológiai, érzelmi és figyelmi válaszokat válthat ki. Ezek a válaszok támogathatják a relaxációt, az ellazulást és a belső fókusz kialakulását.\n\nA modern fizikai kutatások szerint az anyag alapegységei folyamatos mozgásban lévő részecskék és hullámjelenségek formájában írhatók le. Ez az alapelv segít megérteni, hogy a hanghullámok miért képesek kölcsönhatásba lépni az emberi testtel, és miért reagálunk érzékenyen a rezgések változásaira.\n\nAz emberi test magas víztartalma miatt különösen hatékonyan vezeti ezeket a rezgéseket, ami magyarázatot ad arra, hogy a mély, hosszan lecsengő hangok miért kelthetnek erőteljes testi érzeteket.",
      section1_labels: ["Alacsony frekvencia", "Közepes frekvencia", "Magas frekvencia"],
      section2_title: "Biológiai háttér",
      section2_text: "A hangok és rezgések az idegrendszeren keresztül többféle biológiai és élettani folyamatra hathatnak.\n\nA hangterápiás környezetben alkalmazott rezgések stimulálhatják az érzékelő receptorokat, amelyek idegi és elektrofiziológiai válaszokat indítanak el. Ezek a folyamatok a szervezet természetes működésével összhangban zajlanak, és hozzájárulhatnak a nyugalom, az ellazulás vagy a fókuszált figyelem kialakulásához.\n\nBizonyos hangminták és ritmikus struktúrák elősegíthetik a légzés lassulását és mélyülését. A lassabb, egyenletes légzés aktiválhatja a paraszimpatikus idegrendszert, amely a pihenés, regeneráció és helyreállítás állapotaiért felelős. Ennek hatására támogató élettani válaszok jelenhetnek meg, amelyek kedvezően befolyásolhatják a testi és mentális közérzetet.\n\nA vibrációs jellegű testmunka mechanikai úton hathat az izom- és fasciarendszerre. A test magas víztartalma miatt a rezgések hatékonyan terjednek a szövetekben, ami elősegítheti a fizikai ellazulást és a testi érzetek tudatosabb érzékelését.",
      section2_labels: ["Negatív", "Semleges", "Pozitív"],
      fascia_label: "Fascia rendszer",
      autonomic_label: "Autonóm egyensúly",
      legal_title: "HangAkadémia® - Jogi nyilatkozat",
      legal_text: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll. Részletek a Jogi nyilatkozatban."
    },
    en: {
      section1_title: "Physical and Physiological Background",
      section1_text: "The physical and physiological foundations of sound therapy are linked to the fields of acoustics, vibration physics, and neurophysiology.\n\nThe perception and processing of sound vibrations occur through the body and nervous system, triggering various physiological, emotional, and attentional responses. These responses can support relaxation and the development of internal focus.\n\nAccording to modern physics research, the basic units of matter can be described as particles and wave phenomena in constant motion. This principle helps explain why sound waves are able to interact with the human body and why we react sensitively to changes in vibrations.\n\nDue to the high water content of the human body, it conducts these vibrations particularly effectively, explaining why deep, long-decaying sounds can elicit powerful physical sensations.",
      section1_labels: ["Low frequency", "Medium frequency", "High frequency"],
      section2_title: "Biological Background",
      section2_text: "Sounds and vibrations can affect various biological and physiological processes through the nervous system.\n\nVibrations applied in a sound therapy environment can stimulate sensory receptors, initiating neural and electrophysiological responses. These processes occur in harmony with the body's natural functioning and can contribute to the development of calm, relaxation, or focused attention.\n\nCertain sound patterns and rhythmic structures can promote slower and deeper breathing. Slower, steady breathing can activate the parasympathetic nervous system, which is responsible for states of rest, regeneration, and restoration. As a result, supportive physiological responses may appear that favorably influence physical and mental well-being.\n\nVibrational bodywork can act mechanically on the muscle and fascia system. Due to the high water content of the body, vibrations spread effectively through the tissues, promoting physical relaxation and a more conscious perception of bodily sensations.",
      section2_labels: ["Negative", "Neutral", "Positive"],
      fascia_label: "Fascia system",
      autonomic_label: "Autonomic Balance",
      legal_title: "HangAkadémia® - Legal Notice",
      legal_text: "© HangAkadémia® – All rights reserved. Content is protected by copyright. Details in the Legal Notice."
    },
    sk: {
      section1_title: "Fyzikálne a fyziologické pozadie",
      section1_text: "Fyzikálne a fyziologické základy zvukovej terapie sú spojené s oblasťami akustiky, fyziky vibrácií a neurofyziológie.\n\nVnímanie a spracovanie zvukových vibrácií prebieha cez telo a nervový systém, čo vyvoláva rôzne fyziologické, emocionálne a pozornostné reakcie. Tieto reakcie môžu podporiť relaxáciu, uvoľnenie a vytvorenie vnútorného sústredenia.\n\nPodľa moderného fyzikálneho výskumu možno základné jednotky hmoty opísať ako častice a vlnové javy v neustálom pohybe. Tento princíp pomáha pochopiť, prečo sú zvukové vlny schopné interagovať s ľudským telom a prečo citlivo reagujeme na zmeny vibrácií.\n\nVďaka vysokému obsahu vody v ľudskom tele sa tieto vibrácie šíria mimoriadne efektívne, čo vysvetľuje, prečo hlboké, dlho doznievajúce zvuky môžu vyvolávať silné telesné pocity.",
      section1_labels: ["Nízka frekvencia", "Stredná frekvencia", "Vysoká frekvencia"],
      section2_title: "Biologické pozadie",
      section2_text: "Zvuky a vibrácie môžu prostredníctvom nervového systému ovplyvňovať rôzne biologické a fyziologické procesy.\n\nVibrácie aplikované v prostredí zvukovej terapie môžu stimulovať senzorické receptory, čím iniciujú nervové a elektrofyziologické reakcie. Tieto procesy prebiehajú v harmónii s prirodzeným fungovaním tela a môžu prispieť k rozvoju pokoja, relaxácie alebo sústredenej pozornosti.\n\nUrčité zvukové vzorce a rytmické štruktúry môžu podporiť spomalenie a prehĺbenie dýchania. Pomalšie, rovnomerné dýchanie môže aktivovať parasympatický nervový systém, ktorý je zodpovedný za stavy odpočinku, regenerácie a obnovy. V dôsledku toho sa môžu objaviť podporné fyziologické reakcie, ktoré priaznivo ovplyvňujú fyzickú a duševnú pohodu.\n\nVibračná práca s telom môže mechanicky pôsobiť na svalový a fasciálny systém. Vďaka vysokému obsahu vody v tele sa vibrácie efektívne šíria tkanivami, čo podporuje fyzické uvoľnenie a vedomejšie vnímanie telesných pocitov.",
      section2_labels: ["Negatívne", "Neutrálne", "Pozitívne"],
      fascia_label: "Fasciálny systém",
      autonomic_label: "Autonómna rovnováha",
      legal_title: "HangAkadémia® - Právne vyhlásenie",
      legal_text: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom. Podrobnosti v Právnom vyhlásení."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white pb-20">
      {/* Physics Section */}
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-start">
             <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="sticky top-32 w-full flex flex-col items-center">
                  <div className="flex items-center gap-4 mb-10 text-brand-bronze w-full justify-center">
                    <Activity size={48} className="opacity-40" />
                    <h2 className="font-cormorant text-4xl text-brand-brown font-bold leading-tight text-center">
                      {t.section1_title}
                    </h2>
                  </div>
                  <div className="flex flex-col items-center gap-10 w-full max-w-[280px] mx-auto">
                     {[
                       { src: "/images/Frequency-low.svg", label: t.section1_labels[0] },
                       { src: "/images/Frequency-medium.svg", label: t.section1_labels[1] },
                       { src: "/images/Frequency-hight.svg", label: t.section1_labels[2] }
                     ].map((item, idx) => (
                       <div key={idx} className="flex flex-col items-center gap-1 w-full">
                          <div className="relative w-full h-20 grayscale opacity-40">
                             <Image src={item.src} alt={item.label} fill className="object-contain" />
                          </div>
                          <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bronze/60 leading-none mt-1">
                            {item.label}
                          </p>
                       </div>
                     ))}
                  </div>
                </div>
             </div>
             <div className="w-full md:w-1/2 space-y-8">
               <div className="bg-brand-lightbg p-10 rounded-[3rem] border border-brand-bronze/10 shadow-sm">
                  <p className="font-playfair text-xl text-brand-black/80 leading-relaxed whitespace-pre-line">
                    {t.section1_text}
                  </p>
               </div>
               <div className="flex gap-6 p-6 bg-brand-bronze/5 rounded-2xl border border-brand-bronze/10">
                  <Zap className="text-brand-bronze shrink-0" />
                  <p className="font-montserrat text-sm text-brand-black/60 italic">
                    {language === 'hu' ? "A hang mechanikai hullámként találkozik a testtel." : "Sound meets the body as a mechanical wave."}
                  </p>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Biological Section */}
      <section className="py-24 bg-brand-lightbg px-4 rounded-[4rem] mx-4 border border-brand-bronze/5">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div className="order-2 lg:order-1 flex flex-col gap-10 items-center justify-center">
                {[
                  { src: "/images/NegativPositiv-01.svg", label: t.section2_labels[0] },
                  { src: "/images/NegativPositiv-02.svg", label: t.section2_labels[1] },
                  { src: "/images/NegativPositiv-03.svg", label: t.section2_labels[2] }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 w-full max-w-[150px]">
                     <div className="relative w-full h-20 grayscale opacity-40">
                        <Image src={item.src} alt={item.label} fill className="object-contain" />
                     </div>
                     <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.2em] text-brand-black/40 leading-none mt-1">
                        {item.label}
                     </p>
                  </div>
                ))}
             </div>
             <div className="order-1 lg:order-2 space-y-10">
                <div className="flex items-center gap-4 text-brand-bronze justify-center lg:justify-start">
                   <Brain size={48} className="opacity-40" />
                   <h2 className="font-cormorant text-4xl text-brand-brown font-bold uppercase">
                     {t.section2_title}
                   </h2>
                </div>
                <div className="space-y-6">
                   <p className="font-montserrat text-lg text-brand-black/70 leading-relaxed whitespace-pre-line">
                     {t.section2_text}
                   </p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-brand-bronze/5">
                         <Waves className="text-brand-bronze" size={20} />
                         <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-black/40">{t.fascia_label}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-brand-bronze/5">
                         <ThermometerSun className="text-brand-bronze" size={20} />
                         <span className="font-montserrat text-xs font-bold uppercase tracking-wider text-brand-black/40">{t.autonomic_label}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      <LegalSection />
    </div>
  );
}
