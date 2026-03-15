'use client';

import Image from 'next/image';
import { ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import Link from 'next/link';

export function LegalSection() {
  const { language } = useLanguage();

  const dict: Record<Language, { title: string; textPrefix: string; linkLabel: string; textSuffix: string }> = {
    hu: {
      title: "HangAkadémia® - Jogi nyilatkozat",
      textPrefix: "© HangAkadémia® - Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll. Részletek a ",
      linkLabel: "Jogi nyilatkozatban",
      textSuffix: "."
    },
    en: {
      title: "HangAkadémia® - Legal Notice",
      textPrefix: "© HangAkadémia® - All rights reserved. Content is protected by copyright. Details in the ",
      linkLabel: "Legal Notice",
      textSuffix: "."
    },
    sk: {
      title: "HangAkadémia® - Právne vyhlásenie",
      textPrefix: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom. Podrobnosti v ",
      linkLabel: "Právnom vyhlásení",
      textSuffix: "."
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <section className="py-24 bg-white px-4">
      <div className="container max-w-4xl mx-auto text-center">
        <div className="flex flex-col items-center bg-brand-bronze/5 p-12 rounded-[3rem] border border-brand-bronze/10">
          <ShieldAlert className="text-brand-bronze mb-8 opacity-20" size={60} />
          <h2 className="font-cormorant text-3xl text-brand-brown font-bold mb-6">
            {t.title}
          </h2>
          <p className="font-montserrat text-sm text-brand-black/60 leading-relaxed max-w-2xl">
            {t.textPrefix}
            <Link href="/jogi-nyilatkozat" className="underline hover:text-brand-bronze transition-colors">
               {t.linkLabel}
            </Link>
            {t.textSuffix}
          </p>
        </div>
        <div className="mt-20">
          <Image 
            src="/images/PalAdri-logo-stroke.svg" 
            alt="Logo" 
            width={100} 
            height={100} 
            className="filter grayscale opacity-80 mx-auto" 
          />
        </div>
      </div>
    </section>
  );
}
