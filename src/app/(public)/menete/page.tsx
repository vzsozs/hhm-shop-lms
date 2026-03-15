'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { CheckCircle2, Info, Wind, Waves } from 'lucide-react';
import { LegalSection } from '@/components/public/LegalSection';

export default function ProcessPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    intro: string[];
    experience_title: string;
    experience_items: string[];
    experience_outro: string[];
    structure_title: string;
    structure_text: string[];
    legal_notice: string;
    copyright: string;
  }> = {
    hu: {
      intro: [
        "A Himalájai Hangtálmasszázs® kényelmes ruházatban történik, masszázságyon vagy a földön kialakított fekvőfelületen. A folyamatot minden esetben egy rövid, személyes ráhangolódás előzi meg, amely során figyelembe vesszük a vendég aktuális állapotát, érzékenységét és a hangélménnyel kapcsolatos preferenciáit.",
        "A különböző hangtálakat a test köré, illetve meghatározott pontokra helyezzük, mindig a komfortérzethez és az egyéni igényekhez igazítva. A tálakat speciális ütőkkel és dörzseszközökkel hozzuk rezgésbe, így a hanghullámok egyszerre hatnak a halláson keresztül és testi rezgésérzetként.",
        "A rezgések a test természetes struktúráin keresztül terjednek, és sokak számára finom, pulzáló vagy hullámzó érzetként válnak érzékelhetővé.",
        "A hanghullámok terjedését a test természetes módon követi: a lágy rezgések különböző területeken jelenhetnek meg, ahogy a hang „továbbfut” a szövetekben és a test folyadéktereiben. Ez az élmény gyakran támogatja a befelé figyelést és a mély megnyugvást."
      ],
      experience_title: "Az ellazulás élménye",
      experience_items: [
        "a hangminőség és a ritmus segítheti a légzés természetes lassulását,",
        "támogathatja a figyelem befelé fordulását,",
        "kedvezhet a pihenéshez kapcsolódó idegrendszeri állapotoknak,",
        "sokak számára nyugodt, meditatív jelenlétet hozhat létre."
      ],
      experience_outro: [
        "A hangtálmasszázs során gyakran megjelenik az úgynevezett „éber-alvás” állapot, amely az ébrenlét és a teljes ellazulás közötti természetes tudatállapot. Előfordulhat, hogy valaki elszenderedik – ez a mély relaxáció gyakori kísérőjelensége.",
        "A lassú, egyenletes hangminták gyakran együtt járnak a relaxált idegrendszeri állapotokkal (alfa–théta tartomány), amelyek meditáció, légzésgyakorlatok vagy mély pihenés során is megfigyelhetők. Fontos hangsúlyozni, hogy ez nem agyhullám-módosítás, hanem a szervezet természetes reakciója a nyugodt hangmintákra."
      ],
      structure_title: "A hangzás felépítése",
      structure_text: [
        "A Himalájai Hangtálmasszázs® során a test köré elhelyezett duplex és triplex hangtálak összetett, mélyen ellazító hangteret hoznak létre.",
        "A folyamatban jellemzően 15–21 darab, különböző karakterű hangtál, valamint többféle idiofon hangszer hangja kapcsolódik össze finom, egymásra épülő rétegekben.",
        "A hangtálak kiválasztása és összehangolása minden esetben a vendég aktuális állapotához igazodik, így a hangzás rugalmasan alkalmazkodik ahhoz, hogy az adott pillanatban mi támogatja leginkább a nyugodt, kiegyensúlyozott élményt.",
        "A hangzásélményt egy lezáró, integráló beszélgetés kíséri, amely lehetőséget ad a tapasztalatok megosztására és az élmény tudatos lezárására."
      ],
      legal_notice: "Hangakadémia® - Jogi nyilatkozat",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll."
    },
    en: {
      intro: [
        "Himalayan Singing Bowl Massage® is performed in comfortable clothing on a massage table or a padded surface on the floor. The process is always preceded by a short, personal attunement, taking into account the guest's current state, sensitivity, and preferences regarding the sound experience.",
        "Various singing bowls are placed around the body or on specific points, always adjusted to comfort and individual needs. The bowls are set into vibration with special mallets and friction tools, so the sound waves act simultaneously through hearing and as physical vibrations.",
        "Vibrations spread through the natural structures of the body and are perceived by many as a subtle, pulsating, or waving sensation.",
        "The spread of sound waves is naturally followed by the body: soft vibrations can appear in different areas as the sound 'runs' through the tissues and fluid spaces of the body. This experience often supports inward focus and deep calming."
      ],
      experience_title: "The Experience of Relaxation",
      experience_items: [
        "sound quality and rhythm can help the natural slowing of breathing,",
        "can support the inward turning of attention,",
        "can favor nervous system states associated with rest,",
        "can create a calm, meditative presence for many."
      ],
      experience_outro: [
        "During singing bowl massage, the 'wakeful sleep' state often appears, which is a natural conscious state between wakefulness and complete relaxation. Someone might doze off – this is a common accompaniment to deep relaxation.",
        "Slow, steady sound patterns are often associated with relaxed nervous system states (alpha-theta range), which are also observed during meditation, breathing exercises, or deep rest. It is important to emphasize that this is not brainwave modification, but the body's natural reaction to calm sound patterns."
      ],
      structure_title: "Structure of Sound",
      structure_text: [
        "During Himalayan Singing Bowl Massage®, duplex and triplex singing bowls placed around the body create a complex, deeply relaxing sound field.",
        "In the process, typically 15–21 singing bowls with different characters, as well as several types of idiophone instruments, are connected in subtle, overlapping layers.",
        "The selection and harmonization of the singing bowls are always adapted to the guest's current state, so the sound flexibly adapts to what best supports a calm, balanced experience at that moment.",
        "The sound experience is accompanied by a closing, integrating conversation, providing an opportunity to share experiences and consciously close the experience."
      ],
      legal_notice: "Hangakadémia® - Legal Notice",
      copyright: "© HangAkadémia® – All rights reserved. Content is protected by copyright."
    },
    sk: {
      intro: [
        "Masáž himalájskymi spievajúcimi misami® sa vykonáva v pohodlnom oblečení na masážnom stole alebo na podložke na podlahe. Procesu vždy predchádza krátke osobné naladenie, pričom sa berie do úvahy aktuálny stav hosťa, citlivosť a preferencie týkajúce sa zvukového zážitku.",
        "Rôzne spievajúce misy sú umiestnené okolo tela alebo na špecifických bodoch, vždy prispôsobené pohodliu a individuálnym potrebám. Misy sa uvádzajú do vibrácie špeciálnymi paličkami a trecími nástrojmi, takže zvukové vlny pôsobia súčasne cez sluch aj ako fyzické vibrácie.",
        "Vibrácie sa šíria prirodzenými štruktúrami tela a mnohí ich vnímajú ako jemný, pulzujúci alebo vlniaci sa pocit.",
        "Šírenie zvukových vĺn telo prirodzene nasleduje: mäkké vibrácie sa môžu objaviť v rôznych oblastiach, keď zvuk 'beží' cez tkanivá a tekuté priestory tela. Tento zážitok často podporuje vnútorné sústredenie a hlboké upokojenie."
      ],
      experience_title: "Zážitok uvoľnenia",
      experience_items: [
        "kvalita zvuku a rytmus môžu pomôcť prirodzenému spomaleniu dýchania,",
        "môžu podporiť vnútorné obrátenie pozornosti,",
        "môžu priaznivo ovplyvniť stavy nervového systému spojené s odpočinkom,",
        "môžu pre mnohých vytvoriť pokojnú, meditatívnu prítomnosť."
      ],
      experience_outro: [
        "Počas masáže spievajúcimi misami sa často objavuje stav 'bdelého spánku', čo je prirodzený stav vedomia medzi bdením a úplným uvoľnením. Niekto môže zdriemnuť – je to bežný sprievodný jav hlbokej relaxácie.",
        "Pomalé, stále zvukové vzorce sú často spojené s relaxovanými stavmi nervového systému (rozsah alfa-théta), ktoré sa pozorujú aj počas meditácie, dychových cvičení alebo hlbokého odpočinku. Je dôležité zdôrazniť, že nejde o modifikáciu mozgových vĺn, ale o prirodzenú reakciu tela na pokojné zvukové vzorce."
      ],
      structure_title: "Štruktúra zvuku",
      structure_text: [
        "Počas masáže himalájskymi spievajúcimi misami® vytvárajú duplexné a triplexné spievajúce misy umiestnené okolo tela komplexné, hlboko relaxačné zvukové pole.",
        "V procese je zvyčajne 15–21 spievajúcich mís s rôznymi charaktermi, ako aj niekoľko typov idiofónnych nástrojov prepojených v jemných, prekrývajúcich sa vrstvách.",
        "Výber a harmonizácia spievajúcich mís je vždy prispôsobená aktuálnemu stavu hosťa, takže zvuk sa pružne prispôsobuje tomu, čo v danom momente najlepšie podporuje pokojný a vyrovnaný zážitok.",
        "Zvukový zážitok sprevádza záverečný, integračný rozhovor, ktorý poskytuje príležitosť zdieľať skúsenosti a vedome uzavrieť zážitok."
      ],
      legal_notice: "Hangakadémia® - Právne vyhlásenie",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Intro Section */}
      <section className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-center mb-12">
            <Image src="/images/PalAdri-logo-stroke.svg" alt="Logo" width={100} height={100} className="opacity-80" />
          </div>
          
          <div className="space-y-8 text-brand-black/80 text-lg leading-relaxed font-playfair">
            {t.intro.map((p, i) => (
              <p key={i} className={i === 0 ? "first-letter:text-5xl first-letter:font-cormorant first-letter:mr-3 first-letter:float-left first-letter:text-brand-brown" : ""}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-24 bg-brand-lightbg/30 relative overflow-hidden">
        {/* Decorative Wave */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-white to-transparent opacity-50"></div>
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <div className="w-24 h-24 rounded-full bg-brand-bronze/10 flex items-center justify-center shrink-0 border border-brand-bronze/20 text-brand-bronze">
              <Waves size={48} />
            </div>
            <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold italic">
              {t.experience_title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-16">
            {t.experience_items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 border border-brand-bronze/5 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-brand-bronze shrink-0 mt-1" />
                <p className="text-brand-black/80 font-playfair text-lg leading-snug">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center my-12 opacity-30">
            <Image src="/images/ripple-top.svg" alt="Ripple" width={400} height={40} className="w-full max-w-md" />
          </div>

          <div className="space-y-8 text-brand-black/70 text-lg leading-relaxed font-playfair italic bg-white/40 p-8 md:p-12 rounded-3xl border border-brand-bronze/10">
            {t.experience_outro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Structure Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-8 mb-16">
            <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold tracking-tight">
              {t.structure_title}
            </h2>
            <div className="h-px bg-brand-bronze/30 flex-grow"></div>
          </div>

          <div className="space-y-8 text-brand-black/80 text-xl leading-relaxed font-playfair">
            {t.structure_text.map((p, i) => (
              <div key={i} className="flex gap-6 group">
                <span className="text-brand-bronze font-cormorant font-bold text-3xl opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Image Divider */}
      <div className="relative h-64 md:h-96 w-full grayscale opacity-40 overflow-hidden">
        <Image src="/images/Adri-terapia-10.webp" alt="Background" fill className="object-cover" />
      </div>

      <LegalSection />
    </div>
  );
}
