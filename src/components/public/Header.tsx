/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { SUPPORTED_LANGUAGES, Language } from '@/modules/shared/lib/i18n-constants';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  
  const navLinkClass = "px-4 py-2 rounded-[20px] bg-white/15 border border-white/10 text-[#462727] hover:border-white transition-colors tracking-[0.1em] uppercase font-cormorant font-bold text-[0.9em] flex flex-row items-center justify-center relative leading-tight text-center z-10";

  const shopBtnClass = "pl-[12px] pr-4 py-2 rounded-[20px] bg-brand-bronze-light text-white font-normal border border-[#b66f3921] uppercase tracking-[0.1em] font-cormorant text-[0.9em] flex items-center justify-center relative hover:border-white transition-colors h-[34px] z-10";

  const iconBtnClass = "flex items-center justify-center bg-white/15 border border-white/15 rounded-[20px] h-[38px] w-[38px] hover:border-white transition-colors relative cursor-pointer z-10";

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setLangOpen(false);
    router.refresh();
  };

  return (
    <header 
      className="relative w-full flex flex-col items-center justify-end pb-[24px] bg-brand-bronze" 
      style={{ 
        height: '40vh', 
        backgroundImage: "url('/assets/bg.webp')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
       {/* Navigation Wrapper */}
       <div className="absolute top-0 inset-x-0 z-40">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-[1fr_300px_1fr] relative w-full items-start">
             
             {/* Left section */}
             <div className="relative flex flex-col items-end w-full">
                <img src="/assets/menu-left.svg" alt="" className="absolute right-0 top-0 h-[134px] w-full max-w-none backdrop-blur-[3px] -z-10 mix-blend-normal object-cover object-right" />
                <div className="flex flex-row items-center justify-end gap-[1.2em] h-[120px] px-8">
                   <Link href="/hangtal-masszazs" className={navLinkClass}>
                      HIMALÁJAI<br/>HANGTÁLMASSZÁZS<sup>®</sup>
                      <img src="/assets/arrow_mini.svg" className="w-[10px] ml-2" alt=""/>
                   </Link>
                   <Link href="/szolgaltatasok" className={navLinkClass}>
                      SZOLGÁLTATÁSOK
                      <img src="/assets/arrow_mini.svg" className="w-[10px] ml-2" alt=""/>
                   </Link>
                   <Link href="/oktatasok" className={navLinkClass}>
                      OKTATÁSOK
                   </Link>
                </div>
             </div>
             
             {/* Center Section */}
             <div className="relative flex flex-col items-center pt-[76px]">
                <img src="/assets/menu-center.svg" alt="" className="absolute inset-x-0 mx-auto top-[-1px] w-[300px] h-[136px] backdrop-blur-[3px] -z-10 mix-blend-normal origin-top" />
                <Link href="/" className="z-10 h-[190px] -mt-[10px] pl-[12px] relative block">
                   <img src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" alt="Hangakadémia" className="h-[190px] w-auto max-w-none drop-shadow-xl" />
                </Link>
             </div>
             
             {/* Right section */}
             <div className="relative flex flex-col items-start w-full">
                <img src="/assets/menu-right.svg" alt="" className="absolute left-0 top-0 h-[134px] w-full max-w-none backdrop-blur-[3px] -z-10 mix-blend-normal object-cover object-left" />
                <div className="flex flex-row items-center justify-start gap-[1.2em] h-[120px] px-8">
                   <Link href="/galeria" className={navLinkClass}>GALÉRIA</Link>
                   <Link href="/kapcsolat" className={navLinkClass}>KAPCSOLAT</Link>
                   <Link href="/shop" className={shopBtnClass}>
                      SHOP <img src="/assets/icons-cart.svg" className="w-[16px] ml-2" alt=""/>
                   </Link>
                   <Link href="/login" className={iconBtnClass}>
                      <img src="/assets/icons-login.svg" className="h-[20px] w-auto" alt="Login"/>
                   </Link>
                   
                   {/* Language Dropdown Area */}
                   <div 
                     className="absolute right-4 flex flex-col items-center justify-center w-[36px] h-[36px] rounded-full border border-white/30 z-10 cursor-pointer text-white hover:bg-white/10 transition-colors"
                     onClick={() => setLangOpen(!langOpen)}
                   >
                      <span className="text-[10px] font-light leading-none mt-[2px] tracking-widest uppercase">{language}</span>
                      <img src="/assets/arrow_mini-white.svg" className={`w-[6px] mt-[2px] transition-transform ${langOpen ? 'rotate-180' : ''}`} alt=""/>
                      
                      {langOpen && (
                        <div className="absolute top-[40px] right-0 flex flex-col items-center bg-brand-bronze/90 backdrop-blur-md border border-white/10 rounded-xl py-2 shadow-2xl overflow-hidden min-w-[50px] z-[60]">
                           {SUPPORTED_LANGUAGES.map((lang) => (
                              <button 
                                key={lang} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLangChange(lang);
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

       {/* Mobile Header */}
       <div className="md:hidden relative flex items-start justify-between h-[113px] px-4 pt-6">
          <img src="/assets/menu-mobile.svg" alt="" className="absolute left-0 top-0 h-[113px] w-full max-w-none backdrop-blur-[3px] -z-10 mix-blend-normal object-cover object-top" />
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 z-50 relative border border-white/20 rounded-[20px] bg-brand-bronze/50 backdrop-blur-sm">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <div className="relative flex justify-center flex-1">
             <Link href="/" className="absolute -top-[10px] left-1/2 -translate-x-1/2 z-50">
                <img src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" alt="Hangakadémia" className="h-[140px] w-auto drop-shadow-md max-w-none" />
             </Link>
          </div>
          
          <div className="flex items-center gap-2 z-50">
             <div className="relative">
                <button 
                  onClick={() => setLangOpen(!langOpen)}
                  className="p-2 border border-white/20 rounded-[20px] bg-brand-bronze/50 backdrop-blur-sm text-[10px] uppercase tracking-widest text-white w-10 flex items-center justify-center font-light"
                >
                   {language}
                </button>
                {langOpen && (
                  <div className="absolute top-[42px] right-0 flex flex-col items-center bg-brand-bronze/90 backdrop-blur-md border border-white/10 rounded-xl py-1 shadow-2xl overflow-hidden min-w-[50px] z-[60]">
                     {SUPPORTED_LANGUAGES.map((lang) => (
                        <button 
                          key={lang} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLangChange(lang);
                          }}
                          className={`w-full px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors ${language === lang ? 'text-white font-bold' : 'text-white/60'}`}
                        >
                           {lang}
                        </button>
                     ))}
                  </div>
                )}
             </div>
             <Link href="/shop" className="p-2 border border-white/20 rounded-[20px] bg-brand-bronze/50 backdrop-blur-sm">
                <img src="/assets/icons-cart.svg" className="w-5" alt="Shop"/>
             </Link>
          </div>
       </div>

       {/* Mobile Menu Overlay */}
       {mobileMenuOpen && (
         <div className="absolute top-16 left-0 w-full bg-brand-bronze p-6 flex flex-col gap-4 shadow-xl border-t border-white/10 z-40 text-brand-white">
             <Link href="/hangtal-masszazs" className="font-playfair text-lg text-center border-b border-white/10 pb-2">HANGTÁL MASSZÁZS</Link>
             <Link href="/szolgaltatasok" className="font-playfair text-lg text-center border-b border-white/10 pb-2">SZOLGÁLTATÁSOK</Link>
             <Link href="/oktatasok" className="font-playfair text-lg text-center border-b border-white/10 pb-2">OKTATÁSOK</Link>
             <Link href="/galeria" className="font-playfair text-lg text-center border-b border-white/10 pb-2">GALÉRIA</Link>
             <Link href="/kapcsolat" className="font-playfair text-lg text-center border-b border-white/10 pb-2">KAPCSOLAT</Link>
             <Link href="/login" className="font-playfair text-lg text-center pb-2">BEJELENTKEZÉS</Link>
         </div>
       )}
       </div>

       <h1 className="relative font-cormorant font-medium text-[38px] text-white text-center z-10 w-full px-4 drop-shadow-md tracking-[0.01em]">
         Hangakadémia webshop
       </h1>
    </header>
  );
}
