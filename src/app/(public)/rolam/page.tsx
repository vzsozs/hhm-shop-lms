/* eslint-disable @next/next/no-img-element */
'use client';

import { useLanguage } from '../../../context/language-context';
import { Language } from '../../../modules/shared/lib/i18n-constants';
import { Award, Heart, Shield, Sparkles, Star, LucideIcon } from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    hero: {
      title: string;
      subtitle: string;
      quote: string;
      caption: string;
    };
    story: {
      title: string;
      paragraphs: string[];
      meinl_title: string;
      meinl_text: string;
      meinl_footer: string;
    };
    values: {
      title: string;
      items: {
        title: string;
        text: string;
        icon: LucideIcon;
      }[];
    };
  }> = {
    hu: {
      hero: {
        title: "Pál Adrienn",
        subtitle: "Test és lélek harmóniája",
        quote: "\"Hangok érintése a belső egyensúlyért.\"",
        caption: "Nemzetközi Himalájai Hangtálmasszázs® oktató • A Hangakadémia® alapítója\nA Meinl Sonic Energy magyarországi szakmai nagykövete"
      },
      story: {
        title: "A hangok harmonizáló ereje!",
        paragraphs: [
          "Gyermekkorom óta vonzott a keleti kultúrák világa: a harcművészetek, a filozófiák és a meditáció mélyen formálták az utamat. Életem során számos olyan tanítóval, hagyománnyal és mesterséggel találkoztam, amelyek végül a hangok világához vezettek – ahhoz a térhez, ahol a csend és a rezgés együtt hoz létre valódi belső egyensúlyt.",
          "Tanulmányaim során lehetőségem volt elmélyülni a keleti filozófiák és tradicionális rendszerek szemléletében. A Yamamoto Rehabilitációs Intézetben és a Pécsi Tudományegyetem Egészségtudományi Karán megismertem a hagyományos kínai orvoslás elméletét és kapcsolódó módszereit, majd 2023-ban a North China University of Science and Technology egyetemén Kínában további kulturális és filozófiai képzésekben vettem részt.",
          "Ezek a tapasztalatok mélyebb megértést adtak a keleti gondolkodásmódról, az energetikai rendszerekről és a holisztikus megközelítésekről, és erősen hozzájárultak a saját hangalapú munkám kialakulásához. A hangtálakkal 2006 óta foglalkozom, és az évek során számos országban tanultam különböző hangrezgéses és meditációs technikákat – az Egyesült Államoktól Ázsiáig. 2015-ben megalkottam a saját módszeremet, a Himalájai Hangtálmasszázs® Csúsztatásos technikát®, amely ma a Hangakadémia® egyik meghatározó pillére.",
          "Munkám középpontjában a hang élménye, a rezgések tudatos használata és a belső harmónia megteremtése áll. Fontos számomra, hogy mindenki megtalálja azt a belső teret, ahol megnyugvás, csend és jelenlét születik."
        ],
        meinl_title: "Meinl Sonic Energy Nagykövet",
        meinl_text: "2020-ban kezdtem el dolgozni és forgalmazni a Meinl hangszereket. 2024 óta a Meinl Sonic Energy magyarországi nagyköveteként képviselem a márka szakmai és művészi irányvonalát. Feladatom a hangszerek hiteles bemutatása, a hangzáskultúra magas szintű közvetítése, valamint a hangalapú relaxáció és oktatás szakmai támogatása.",
        meinl_footer: "Szeretettel várlak a hangok útján – egy olyan utazáson, amely a belső harmónia és a lélek csendje felé vezet."
      },
      values: {
        title: "Értékeim",
        items: [
          { title: "Hitelesség", text: "Több mint 18 év tapasztalat a hangtálak világában.", icon: Award as LucideIcon },
          { title: "Szakmaiság", text: "Nemzetközi oktatói és egészségügyi háttér.", icon: Shield as LucideIcon },
          { title: "Holisztikus szemlélet", text: "Test, lélek és szellem egysége.", icon: Heart as LucideIcon },
          { title: "Minőség", text: "A Meinl Sonic Energy hivatalos képviselete.", icon: Star as LucideIcon }
        ]
      }
    },
    en: {
      hero: {
        title: "Adrienn Pál",
        subtitle: "Harmony of Body and Soul",
        quote: "\"The touch of sounds for inner balance.\"",
        caption: "International Himalayan Singing Bowl Massage® Instructor • Founder of Hangakadémia®\nProfessional Ambassador of Meinl Sonic Energy in Hungary"
      },
      story: {
        title: "The Harmonizing Power of Sounds!",
        paragraphs: [
          "Since childhood, I have been drawn to the world of Eastern cultures: martial arts, philosophies, and meditation have deeply shaped my path. Throughout my life, I have encountered many teachers, traditions, and crafts that eventually led me to the world of sounds – to that space where silence and vibration together create true inner balance.",
          "In my studies, I had the opportunity to immerse myself in the perspective of Eastern philosophies and traditional systems. At the Yamamoto Rehabilitation Institute and the Faculty of Health Sciences of the University of Pécs, I learned the theory and related methods of traditional Chinese medicine, and in 2023, I participated in further cultural and philosophical training at North China University of Science and Technology in China.",
          "These experiences gave me a deeper understanding of Eastern thinking, energy systems, and holistic approaches, and strongly contributed to the development of my own sound-based work. I have been working with singing bowls since 2006, and over the years, I have studied various sound vibration and meditation techniques in many countries – from the United States to Asia. In 2015, I created my own method, the Himalayan Singing Bowl Massage® Sliding Technique®, which is today one of the defining pillars of Hangakadémia®.",
          "The focus of my work is the experience of sound, the conscious use of vibrations, and creating inner harmony. It is important to me that everyone finds that inner space where peace, silence, and presence are born."
        ],
        meinl_title: "Meinl Sonic Energy Ambassador",
        meinl_text: "In 2020, I began working with and distributing Meinl instruments. Since 2024, I have been representing the professional and artistic direction of the brand as the Hungarian ambassador for Meinl Sonic Energy. My task is the authentic presentation of the instruments, the high-level transmission of sound culture, and the professional support of sound-based relaxation and education.",
        meinl_footer: "I welcome you with love on the path of sounds – a journey that leads toward inner harmony and the silence of the soul."
      },
      values: {
        title: "My Values",
        items: [
          { title: "Authenticity", text: "More than 18 years of experience in the world of singing bowls.", icon: Award as LucideIcon },
          { title: "Professionalism", text: "International instructor and health background.", icon: Shield as LucideIcon },
          { title: "Holistic Approach", text: "Unity of body, soul, and spirit.", icon: Heart as LucideIcon },
          { title: "Quality", text: "Official representation of Meinl Sonic Energy.", icon: Star as LucideIcon }
        ]
      }
    },
    sk: {
      hero: {
        title: "Adrienn Pál",
        subtitle: "Harmónia tela a duše",
        quote: "\"Dotyk zvukov pre vnútornú rovnováhu.\"",
        caption: "Medzinárodná inštruktorka masáže himalájskymi spievajúcimi misami® • Zakladateľka Hangakadémia®\nOdborná ambasadorka Meinl Sonic Energy v Maďarsku"
      },
      story: {
        title: "Harmonizujúca sila zvukov!",
        paragraphs: [
          "Od detstva ma priťahoval svet východných kultúr: bojové umenia, filozofie a meditácia hlboko ovplyvnili moju cestu. Počas svojho života som sa stretla s mnohými učiteľmi, tradíciami a remeslami, ktoré ma nakoniec priviedli k svetu zvukov – do toho priestoru, kde ticho a vibrácie spoločne vytvárajú skutočnú vnútornú rovnováhu.",
          "Počas štúdia som mala možnosť ponoriť sa do perspektívy východných filozofií a tradičných systémov. Na Rehabilitačnom inštitúte Yamamoto a na Fakulte zdravotníckych vied Univerzity v Pécsi som sa naučila teóriu a súvisiace metódy tradičnej čínskej medicíny a v roku 2023 som sa zúčastnila ďalšieho kultúrneho a filozofického školenia na North China University of Science and Technology v Číne.",
          "Tieto skúsenosti mi poskytli hlbšie pochopenie východného myslenia, energetických systémov a holistických prístupov a výrazne prispeli k rozvoju mojej vlastnej zvukovej práce. So spievajúcimi misami pracujem od roku 2006 a počas rokov som študovala rôzne techniky zvukových vibrácií a meditácie v mnohých krajinách – od Spojených štátov po Áziu. V roku 2015 som vytvorila vlastnú metódu, Posuvnú techniku masáže himalájskymi spievajúcimi misami®, ktorá je dnes jedným z definujúcich pilierov Hangakadémia®.",
          "Stredobodom mojej práce je zážitok zo zvuku, vedomé používanie vibrácií a vytváranie vnútornej harmónie. Je pre mňa dôležité, aby každý našiel ten vnútorný priestor, kde sa rodí pokoj, ticho a prítomnosť."
        ],
        meinl_title: "Ambasadorka Meinl Sonic Energy",
        meinl_text: "V roku 2020 som začala pracovať s nástrojmi Meinl a distribuovať ich. Od roku 2024 zastupujem odborné a umelecké smerovanie značky ako maďarská ambasadorka pre Meinl Sonic Energy. Mojou úlohou je autentická prezentácia nástrojov, prenos zvukovej kultúry na vysokej úrovni a odborná podpora relaxácie a vzdelávania založeného na zvuku.",
        meinl_footer: "S láskou vás pozývam na cestu zvukov – cestu, ktorá vedie k vnútornej harmónii a tichu duše."
      },
      values: {
        title: "Moje hodnoty",
        items: [
          { title: "Autentickosť", text: "Viac ako 18 rokov skúseností vo svete spievajúcich mís.", icon: Award as LucideIcon },
          { title: "Profesionalita", text: "Medzinárodná inštruktorka a zdravotnícke pozadie.", icon: Shield as LucideIcon },
          { title: "Holisticý prístup", text: "Jednota tela, duše a ducha.", icon: Heart as LucideIcon },
          { title: "Kvalita", text: "Oficiálne zastúpenie Meinl Sonic Energy.", icon: Star as LucideIcon }
        ]
      }
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/bg.webp" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-white/0 via-brand-white/20 to-brand-white"></div>
        </div>
        
        <div className="container relative z-10 px-4 text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-brand-bronze overflow-hidden shadow-2xl animate-in zoom-in duration-1000">
               <img 
                 src="/images/Ardi1.webp" 
                 alt="Pál Adrienn" 
                 className="w-full h-full object-cover"
               />
            </div>
          </div>
          <h1 className="font-cormorant text-5xl md:text-7xl text-brand-brown font-bold tracking-tight mb-4">
            {t.hero.title}
          </h1>
          <p className="font-cormorant text-2xl md:text-3xl text-brand-bronze italic mb-6">
            {t.hero.subtitle}
          </p>
          <div className="w-16 h-px bg-brand-bronze mx-auto mb-6"></div>
          <p className="text-brand-black/70 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
            {t.hero.quote}
          </p>
        </div>
      </section>

      {/* Intro Stats/Bio Caption */}
      <section className="py-12 bg-brand-brown/5">
        <div className="container px-4 text-center">
           <p className="whitespace-pre-line text-brand-brown/80 font-montserrat text-sm md:text-base leading-relaxed max-w-3xl mx-auto font-semibold uppercase tracking-widest">
             {t.hero.caption}
           </p>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex justify-center mb-12">
            <img src="/images/PalAdri-logo-stroke.svg" alt="Logo" className="w-16 h-16 opacity-30" />
          </div>
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown text-center font-bold mb-16">
            {t.story.title}
          </h2>
          
          <div className="space-y-8 text-brand-black/80 text-lg leading-relaxed font-playfair">
            {t.story.paragraphs.map((p: string, i: number) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Meinl Section */}
      <section className="py-24 bg-brand-bronze/5">
        <div className="container px-4 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative group overflow-hidden rounded-3xl shadow-2xl">
                 <img 
                   src="/images/Meinl-ambassador.webp" 
                   alt="Meinl Sonic Energy" 
                   className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                 />
                 <div className="absolute inset-0 ring-1 ring-inset ring-brand-brown/10 rounded-3xl"></div>
              </div>
              <div className="space-y-8">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-brown/10 text-brand-brown text-sm font-bold uppercase tracking-widest">
                   <Sparkles className="w-4 h-4" />
                   {t.story.meinl_title}
                 </div>
                 <p className="text-xl md:text-2xl text-brand-black/80 font-playfair leading-relaxed italic">
                   {t.story.meinl_text}
                 </p>
                 <div className="w-24 h-px bg-brand-bronze"></div>
                 <p className="text-brand-brown text-xl font-cormorant font-bold">
                   {t.story.meinl_footer}
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-brand-white">
        <div className="container max-w-7xl mx-auto">
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown text-center font-bold mb-20">
            {t.values.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.values.items.map((item, i: number) => (
              <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl bg-brand-bronze/5 border border-brand-bronze/10 transition-all hover:shadow-lg hover:border-brand-bronze/30 group">
                <div className="w-16 h-16 rounded-full bg-brand-brown/10 flex items-center justify-center mb-6 group-hover:bg-brand-brown group-hover:text-white transition-colors duration-500">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-cormorant text-2xl text-brand-brown font-bold mb-4">{item.title}</h3>
                <p className="text-brand-black/60 font-playfair">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Small Gallery / Social */}
      <section className="py-24 px-4 bg-brand-brown text-white">
        <div className="container max-w-7xl mx-auto">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <img src="/images/Hangtalas_kepek01.webp" className="w-full h-64 object-cover rounded-xl opacity-80 hover:opacity-100 transition-opacity" alt="Gallery 1" />
              <img src="/images/Hangtalas_kepek02.webp" className="w-full h-64 object-cover rounded-xl opacity-80 hover:opacity-100 transition-opacity" alt="Gallery 2" />
              <img src="/images/Hangtalas_kepek03.webp" className="w-full h-64 object-cover rounded-xl opacity-80 hover:opacity-100 transition-opacity" alt="Gallery 3" />
              <img src="/images/Hangtalas_kepek04.webp" className="w-full h-64 object-cover rounded-xl opacity-80 hover:opacity-100 transition-opacity" alt="Gallery 4" />
           </div>
           <div className="mt-16 text-center">
              <a 
                href="/galeria" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bronze hover:bg-brand-bronze/90 text-white font-bold rounded-full transition-all hover:scale-105"
              >
                {language === 'hu' ? 'Nézze meg a teljes galériát' : language === 'en' ? 'View Full Gallery' : 'Zobraziť celú galériu'}
              </a>
           </div>
        </div>
      </section>
    </div>
  );
}
