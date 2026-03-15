'use client';

import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { ShieldAlert, Scale, Copyright, AlertTriangle } from 'lucide-react';

export default function LegalNoticePage() {
  const { language } = useLanguage();

  const dict: Record<Language, {
    title: string;
    sections: {
      title: string;
      icon: any;
      content: string;
    }[];
  }> = {
    hu: {
      title: "Jogi nyilatkozat",
      sections: [
        {
          title: "Szerzői jogvédelem",
          icon: Copyright,
          content: "A weboldalon található minden tartalom (szövegek, grafikák, fotók, videók, elrendezés stb.) a HangAkadémia® szellemi tulajdonát képezi, és szerzői jogvédelem alatt áll. Bármilyen nemű felhasználás, másolás vagy terjesztés kizárólag a jogtulajdonos előzetes írásbeli engedélyével lehetséges."
        },
        {
          title: "Védjegyoltalom",
          icon: ShieldAlert,
          content: "A HangAkadémia®, Himalájai Hangtálmasszázs®, Csúsztatásos technika® nevek és logók bejegyzett védjegyek. Jogosulatlan használatuk jogi következményeket von maga után."
        },
        {
          title: "Felelősség kizárása",
          icon: AlertTriangle,
          content: "A weboldalon közzétett információk tájékoztató jellegűek. Bár mindent megteszünk az adatok pontosságáért, nem vállalunk felelősséget az esetleges elírásokból vagy a tartalmak értelmezéséből adódó közvetlen vagy közvetett károkért."
        },
        {
          title: "Jogérvényesítés",
          icon: Scale,
          content: "Az oldallal kapcsolatos bármilyen jogvita esetén a magyar jogrend szabályai az irányadóak."
        }
      ]
    },
    en: {
      title: "Legal Notice",
      sections: [
        {
          title: "Copyright Protection",
          icon: Copyright,
          content: "All content on this website (texts, graphics, photos, videos, layout, etc.) is the intellectual property of HangAkadémia® and is protected by copyright. Any use, reproduction, or distribution is only possible with the prior written consent of the copyright holder."
        },
        {
          title: "Trademark Protection",
          icon: ShieldAlert,
          content: "The names and logos HangAkadémia®, Himalayan Singing Bowl Massage®, and Sliding Technique® are registered trademarks. Their unauthorized use will result in legal action."
        },
        {
          title: "Disclaimer of Liability",
          icon: AlertTriangle,
          content: "The information published on the website is for informational purposes only. While we make every effort to ensure the accuracy of the data, we do not accept liability for direct or indirect damages resulting from potential misspellings or interpretations of the content."
        },
        {
          title: "Jurisdiction",
          icon: Scale,
          content: "In the event of any legal dispute regarding the side, the rules of the Hungarian legal system shall apply."
        }
      ]
    },
    sk: {
      title: "Právne vyhlásenie",
      sections: [
        {
          title: "Autorské práva",
          icon: Copyright,
          content: "Všetok obsah na tejto webovej stránke (texty, grafika, fotografie, videá, rozloženie atď.) je duševným vlastníctvom HangAkadémia® a je chránený autorským právom. Akékoľvek použitie, kopírovanie alebo šírenie je možné len s predchádzajúcim písomným súhlasom majiteľa práv."
        },
        {
          title: "Ochrana ochranných známok",
          icon: ShieldAlert,
          content: "Názvy a logá HangAkadémia®, Himalájska masáž spievajúcimi misami®, Kĺzavá technika® sú registrované ochranné známky. Ich neoprávnené použitie má za následok právne následky."
        },
        {
          title: "Vylúčenie zodpovednosti",
          icon: AlertTriangle,
          content: "Informácie zverejnené na webovej stránke majú len informatívny charakter. Hoci vynakladáme maximálne úsilie na zabezpečenie presnosti údajov, nenesieme zodpovednosť za priame alebo nepriame škody vyplývajúce z prípadných preklepov alebo interpretácie obsahu."
        },
        {
          title: "Uplatňovanie práva",
          icon: Scale,
          content: "V prípade akéhokoľvek právneho sporu týkajúceho sa stránky sú rozhodujúce pravidlá maďarského právneho systému."
        }
      ]
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="min-h-screen bg-brand-white pt-32 pb-24 px-4">
      <div className="container max-w-4xl mx-auto">
        <h1 className="font-cormorant text-5xl md:text-6xl text-brand-brown font-bold mb-16 text-center">
          {t.title}
        </h1>
        
        <div className="space-y-8">
          {t.sections.map((section, index) => (
            <div 
              key={index}
              className="bg-white p-8 md:p-12 rounded-[2rem] border border-brand-bronze/10 shadow-sm hover:shadow-md transition-shadow duration-500"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="bg-brand-bronze/5 p-4 rounded-2xl">
                  <section.icon className="text-brand-bronze" size={32} />
                </div>
                <h2 className="font-cormorant text-2xl text-brand-brown font-bold uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>
              <p className="font-montserrat text-brand-black/70 leading-relaxed text-lg">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
