
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { HEADER_CONFIGS, DEFAULT_HEADER_CONFIG } from './header/header-config';
import { DesktopNav } from './header/DesktopNav';
import { MobileNav } from './header/MobileNav';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hhmOpen, setHhmOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const isHome = pathname === '/';

  // Dynamic config based on pathname
  const config = useMemo(() => {
    return HEADER_CONFIGS[pathname] || DEFAULT_HEADER_CONFIG;
  }, [pathname]);
  
  const navLinkClass = "px-4 py-2 rounded-[20px] bg-white/15 border border-white/10 text-[#462727] hover:border-white transition-colors tracking-[0.1em] uppercase font-cormorant font-bold text-[0.9em] flex flex-row items-center justify-center relative leading-tight text-center z-10";
  const shopBtnClass = "pl-[12px] pr-4 py-2 rounded-[20px] bg-brand-bronze-light text-white font-normal border border-[#b66f3921] uppercase tracking-[0.1em] font-cormorant text-[0.9em] flex items-center justify-center relative hover:border-white transition-colors h-[34px] z-10";
  const iconBtnClass = "flex items-center justify-center bg-white/15 border border-white/15 rounded-full h-[38px] w-[38px] hover:border-white transition-colors relative cursor-pointer z-10";

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
    router.refresh();
  };

  const dict = {
    hu: { subtitle: "Üdvözöllek a rezgések, frekvenciák és a hangok világában.", cta: "Időpontfoglalás" },
    en: { subtitle: "Welcome to the world of vibrations, frequencies, and sounds.", cta: "Book an Appointment" },
    sk: { subtitle: "Vitajte vo svete vibrácií, frekvencií a zvukov.", cta: "Objednať sa" }
  };
  const t = dict[language];

  return (
    <header className={`relative w-full flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ${isHome ? 'h-screen' : 'h-[40vh] pb-[24px] justify-end'}`}>
      <Image 
        src={config.backgroundImage} 
        alt="Background" 
        fill 
        priority 
        className="object-cover object-center -z-0"
        key={config.backgroundImage} 
      />
      
      {/* Navigation Wrapper */}
      <div className="absolute top-0 inset-x-0 z-[100]">
        <DesktopNav 
          language={language}
          onLanguageChange={handleLangChange}
          langOpen={langOpen}
          setLangOpen={setLangOpen}
          hhmOpen={hhmOpen}
          setHhmOpen={setHhmOpen}
          servicesOpen={servicesOpen}
          setServicesOpen={setServicesOpen}
          navLinkClass={navLinkClass}
          shopBtnClass={shopBtnClass}
          iconBtnClass={iconBtnClass}
        />

        <MobileNav 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          language={language}
          onLanguageChange={handleLangChange}
          langOpen={langOpen}
          setLangOpen={setLangOpen}
          hhmOpen={hhmOpen}
          setHhmOpen={setHhmOpen}
          servicesOpen={servicesOpen}
          setServicesOpen={setServicesOpen}
        />
      </div>

      <div className={`relative z-10 w-full px-4 flex flex-col items-center text-center transition-all duration-700 ${isHome ? 'gap-1 pt-[20px]' : 'gap-2'}`}>
        <h1 className={`font-cormorant drop-shadow-md text-white transition-all duration-700 ${isHome ? 'text-[48px] md:text-[80px] font-bold tracking-tight' : 'font-medium text-[38px] md:text-[48px]'}`}>
          {config.title}
        </h1>
        
        {isHome && (
          <div className="flex flex-col items-center gap-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            <p className="font-cormorant text-xl md:text-3xl text-white/90 italic max-w-3xl drop-shadow-lg leading-relaxed px-4">
               &quot;{t.subtitle}&quot;
            </p>
            <Link href="/kapcsolat" className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-12 py-5 text-lg rounded-full backdrop-blur-md transition-all shadow-2xl hover:scale-105 font-cormorant tracking-[0.2em] uppercase">
              {t.cta}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
