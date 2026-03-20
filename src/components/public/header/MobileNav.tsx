
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useSession } from "next-auth/react";
import { Language, SUPPORTED_LANGUAGES } from '@/modules/shared/lib/i18n-constants';
import { CartToggleButton } from '@/components/shop/cart-toggle-button';

interface MobileNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  langOpen: boolean;
  setLangOpen: (open: boolean) => void;
  hhmOpen: boolean;
  setHhmOpen: (open: boolean) => void;
  servicesOpen: boolean;
  setServicesOpen: (open: boolean) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  language,
  onLanguageChange,
  langOpen,
  setLangOpen,
  hhmOpen,
  setHhmOpen,
  servicesOpen,
  setServicesOpen,
}) => {
  const { data: session } = useSession();
  const profileHref = session ? "/profil" : "/login";
  const profileLabel = session ? (language === "hu" ? "PROFILOM" : language === "en" ? "MY PROFILE" : "MÔJ PROFIL") : (language === "hu" ? "BEJELENTKEZÉS" : language === "en" ? "LOGIN" : "PRIHLÁSENIE");

  return (
    <>
      <div className="xl:hidden relative flex items-start justify-between h-[90px] px-4 pt-4">
        <div className="absolute left-0 top-[-20px] h-[113px] w-full -z-10 backdrop-blur-[3px] overflow-hidden">
          <Image src="/assets/menu-mobile.svg" alt="" fill className="mix-blend-normal object-cover object-top" />
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 z-[110] relative border border-white/20 rounded-full bg-brand-white/50 backdrop-blur-sm">
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <div className="relative flex justify-center flex-1 h-[100px]">
          <Link href="/" className="absolute top-[20px] left-[calc(50%+30px)] -translate-x-1/2 z-[110] w-[150px]">
            <Image 
              src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" 
              alt="Hangakadémia" 
              height={100} 
              width={150} 
              priority 
              className="h-full w-full object-contain drop-shadow-md" 
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-2 z-[110]">
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="p-2 border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm text-[10px] uppercase tracking-widest text-white w-10 h-10 flex items-center justify-center font-light"
            >
              {language}
            </button>
            {langOpen && (
              <div className="absolute top-[42px] right-0 flex flex-col items-center bg-brand-bronze/90 backdrop-blur-md border border-white/10 rounded-xl py-1 shadow-2xl overflow-hidden min-w-[50px] z-[120]">
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
          <CartToggleButton className="p-2 border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm w-10 h-10 flex items-center justify-center" imageWidth={20} imageHeight={20} />
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="absolute top-[0px] left-0 w-full bg-brand-bronze/98 backdrop-blur-xl p-6 pt-24 flex flex-col gap-4 shadow-xl z-[120] text-brand-white h-screen overflow-y-auto">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 left-4 p-2 z-[130] border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col">
            <button 
              onClick={() => setHhmOpen(!hhmOpen)}
              className="font-playfair text-lg text-center border-b border-white/10 pb-2 flex items-center justify-center gap-2"
            >
              HANGTÁL MASSZÁZS
              <Image src="/assets/arrow_mini-white.svg" width={10} height={10} className={`transition-transform ${hhmOpen ? 'rotate-180' : ''}`} alt=""/>
            </button>
            {hhmOpen && (
              <div className="flex flex-col gap-3 py-4 bg-white/5 mt-1 rounded-lg">
                <Link href="/hangterapia" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Hangterápia</Link>
                <Link href="/hangtalak" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Himalájai hangtálak</Link>
                <Link href="/hangtal-masszazs" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80 font-bold">Himalájai Hangtálmasszázs®</Link>
                <Link href="/tudomanyos-alapok" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Tudományos alapok</Link>
                </div>
            )}
          </div>

          <div className="flex flex-col">
            <button 
              onClick={() => setServicesOpen(!servicesOpen)}
              className="font-playfair text-lg text-center border-b border-white/10 pb-2 flex items-center justify-center gap-2"
            >
              SZOLGÁLTATÁSOK
              <Image src="/assets/arrow_mini-white.svg" width={10} height={10} className={`transition-transform ${servicesOpen ? 'rotate-180' : ''}`} alt=""/>
            </button>
            {servicesOpen && (
              <div className="flex flex-col gap-3 py-4 bg-white/5 mt-1 rounded-lg">
                <Link href="/rolam" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Rólam</Link>
                <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Média megjelenések</Link>
                <Link href="/alkalmazasi-terulet" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Alkalmazási terület</Link>
                <Link href="/menete" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Hangtálmasszázs® menete</Link>
                <Link href="/arak" onClick={() => setMobileMenuOpen(false)} className="text-center text-sm font-poppins hover:text-white/80">Árak</Link>
              </div>
            )}
          </div>

          <Link href="/oktatasok" onClick={() => setMobileMenuOpen(false)} className="font-playfair text-lg text-center border-b border-white/10 pb-2">OKTATÁSOK</Link>
          <Link href="/galeria" onClick={() => setMobileMenuOpen(false)} className="font-playfair text-lg text-center border-b border-white/10 pb-2">GALÉRIA</Link>
          <Link href="/kapcsolat" onClick={() => setMobileMenuOpen(false)} className="font-playfair text-lg text-center border-b border-white/10 pb-2">KAPCSOLAT</Link>
          <Link href={profileHref} onClick={() => setMobileMenuOpen(false)} className="font-playfair text-lg text-center pb-2 uppercase">{profileLabel}</Link>
        </div>
      )}
    </>
  );
};
