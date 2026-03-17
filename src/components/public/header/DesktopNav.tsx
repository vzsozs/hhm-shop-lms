
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from "next-auth/react";
import { Language, SUPPORTED_LANGUAGES } from '@/modules/shared/lib/i18n-constants';
import { NavSubmenu } from './NavSubmenu';

interface DesktopNavProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  langOpen: boolean;
  setLangOpen: (open: boolean) => void;
  hhmOpen: boolean;
  setHhmOpen: (open: boolean) => void;
  servicesOpen: boolean;
  setServicesOpen: (open: boolean) => void;
  navLinkClass: string;
  shopBtnClass: string;
  iconBtnClass: string;
}

export const DesktopNav: React.FC<DesktopNavProps> = ({
  language,
  onLanguageChange,
  langOpen,
  setLangOpen,
  hhmOpen,
  setHhmOpen,
  servicesOpen,
  setServicesOpen,
  navLinkClass,
  shopBtnClass,
  iconBtnClass
}) => {
  const { data: session } = useSession();
  const profileHref = session ? "/profil" : "/login";

  return (
    <div className="hidden xl:grid grid-cols-[1fr_300px_1fr] relative w-full items-start">
      {/* Left section */}
      <div className="relative flex flex-col items-end w-full">
        <div className="absolute right-0 top-0 h-[134px] w-full -z-10 backdrop-blur-[3px] overflow-hidden">
          <Image src="/assets/menu-left.svg" alt="" fill className="mix-blend-normal object-cover object-right" />
        </div>
        <div className="flex flex-row items-center justify-end gap-[1.2em] h-[120px] px-8">
          <NavSubmenu 
            label={<>HIMALÁJAI<br/>HANGTÁLMASSZÁZS<sup>®</sup></>}
            isOpen={hhmOpen}
            onToggle={setHhmOpen}
            className={navLinkClass}
            items={[
              { href: "/hangterapia", label: "Hangterápia" },
              { href: "/hangtalak", label: "Himalájai hangtálak" },
              { href: "/hangtal-masszazs", label: "Himalájai Hangtálmasszázs®" },
              { href: "/tudomanyos-alapok", label: "Tudományos alapok" }
            ]}
            language={language}
          />

          <NavSubmenu 
            label="SZOLGÁLTATÁSOK"
            isOpen={servicesOpen}
            onToggle={setServicesOpen}
            className={navLinkClass}
            items={[
              { href: "/rolam", label: "Rólam" },
              { href: "/media", label: "Média megjelenések" },
              { href: "/alkalmazasi-terulet", label: "Alkalmazási terület" },
              { href: "/menete", label: "Hangtálmasszázs® menete" },
              { href: "/arak", label: "Árak" }
            ]}
            language={language}
          />
          
          <Link href="/oktatasok" className={navLinkClass}>
            OKTATÁSOK
          </Link>
        </div>
      </div>
      
      {/* Center Section */}
      <div className="relative flex flex-col items-center pt-[76px]">
        <div className="absolute inset-x-0 mx-auto top-[-1px] w-[300px] h-[136px] -z-10 backdrop-blur-[3px] origin-top">
          <Image src="/assets/menu-center.svg" alt="" fill className="mix-blend-normal object-contain" />
        </div>
        <Link href="/" className="z-10 h-[190px] -mt-[10px] pl-[12px] relative block">
          <Image src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" alt="Hangakadémia" height={190} width={300} priority className="h-[190px] w-auto drop-shadow-xl" />
        </Link>
      </div>
      
      {/* Right section */}
      <div className="relative flex flex-col items-start w-full">
        <div className="absolute left-0 top-0 h-[134px] w-full -z-10 backdrop-blur-[3px] overflow-hidden">
          <Image src="/assets/menu-right.svg" alt="" fill className="mix-blend-normal object-cover object-left" />
        </div>
        <div className="flex flex-row items-center justify-start gap-[1.2em] h-[120px] px-8">
          <Link href="/galeria" className={navLinkClass}>GALÉRIA</Link>
          <Link href="/kapcsolat" className={navLinkClass}>KAPCSOLAT</Link>
          <Link href="/shop" className={shopBtnClass}>
            SHOP <Image src="/assets/icons-cart.svg" width={16} height={16} className="ml-2" alt=""/>
          </Link>
          <Link href={profileHref} className={iconBtnClass}>
            <Image src="/assets/icons-login.svg" width={20} height={20} className="h-[20px] w-auto" alt="Login"/>
          </Link>
          
          {/* Language Dropdown Area */}
          <div 
            className="absolute right-4 flex flex-col items-center justify-center w-[36px] h-[36px] rounded-full border border-white/30 z-10 cursor-pointer text-white hover:bg-white/10 transition-colors"
            onClick={() => setLangOpen(!langOpen)}
          >
            <span className="text-[10px] font-light leading-none mt-[2px] tracking-widest uppercase">{language}</span>
            <Image src="/assets/arrow_mini-white.svg" width={6} height={6} className={`mt-[2px] transition-transform ${langOpen ? 'rotate-180' : ''}`} alt=""/>
            
            {langOpen && (
              <div className="absolute top-[40px] right-0 flex flex-col items-center bg-brand-bronze/90 backdrop-blur-md border border-white/10 rounded-xl py-2 shadow-2xl overflow-hidden min-w-[50px] z-[60]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button 
                    key={lang} 
                    onClick={(e) => {
                      e.stopPropagation();
                      onLanguageChange(lang);
                    }}
                    className={`w-full px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors ${language === lang ? 'text-white font-bold' : 'text-white/60'}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
