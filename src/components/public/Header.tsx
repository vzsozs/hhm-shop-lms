
'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
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

  return (
    <header className="relative w-full flex flex-col items-center justify-end pb-[24px] bg-brand-bronze overflow-hidden h-[40vh]">
      <Image 
        src={config.backgroundImage} 
        alt="Background" 
        fill 
        priority 
        className="object-cover object-center -z-0"
        key={config.backgroundImage} // Force re-animation/fade on change
      />
      
      {/* Navigation Wrapper */}
      <div className="absolute top-0 inset-x-0 z-40">
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

      <h1 className="relative font-cormorant font-medium text-[38px] md:text-[48px] text-white text-center z-10 w-full px-4 drop-shadow-md tracking-[0.01em] uppercase">
        {config.title}
      </h1>
    </header>
  );
}
