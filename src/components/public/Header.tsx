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
  const [hhmOpen, setHhmOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  
  const navLinkClass = "px-4 py-2 rounded-[20px] bg-white/15 border border-white/10 text-[#462727] hover:border-white transition-colors tracking-[0.1em] uppercase font-cormorant font-bold text-[0.9em] flex flex-row items-center justify-center relative leading-tight text-center z-10";

  const shopBtnClass = "pl-[12px] pr-4 py-2 rounded-[20px] bg-brand-bronze-light text-white font-normal border border-[#b66f3921] uppercase tracking-[0.1em] font-cormorant text-[0.9em] flex items-center justify-center relative hover:border-white transition-colors h-[34px] z-10";

  const iconBtnClass = "flex items-center justify-center bg-white/15 border border-white/15 rounded-full h-[38px] w-[38px] hover:border-white transition-colors relative cursor-pointer z-10";

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
          <div className="hidden xl:grid grid-cols-[1fr_300px_1fr] relative w-full items-start">
             
             {/* Left section */}
             <div className="relative flex flex-col items-end w-full">
                <img src="/assets/menu-left.svg" alt="" className="absolute right-0 top-0 h-[134px] w-full max-w-none backdrop-blur-[3px] -z-10 mix-blend-normal object-cover object-right" />
                 <div className="flex flex-row items-center justify-end gap-[1.2em] h-[120px] px-8">
                    <div className="relative group" 
                         onMouseEnter={() => setHhmOpen(true)} 
                         onMouseLeave={() => setHhmOpen(false)}
                         onClick={() => setHhmOpen(!hhmOpen)}
                    >
                       <button className={navLinkClass}>
                          HIMALÁJAI<br/>HANGTÁLMASSZÁZS<sup>®</sup>
                          <img src="/assets/arrow_mini.svg" className={`w-[10px] ml-2 transition-transform ${hhmOpen ? 'rotate-180' : ''}`} alt=""/>
                       </button>
                       {hhmOpen && (
                         <div className="absolute top-full left-1/2 -translate-x-1/2 w-[280px] bg-brand-bronze/95 backdrop-blur-md border border-white/10 rounded-xl py-4 shadow-2xl z-50 flex flex-col items-center gap-2">
                           <Link href="/hangterapia" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Hangterápia</Link>
                           <Link href="/hangtalak" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Himalájai hangtálak</Link>
                           <Link href="/hangtal-masszazs" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Himalájai Hangtálmasszázs®</Link>
                           <Link href="/tudomanyos-alapok" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Tudományos alapok</Link>
                           <Link href="/eszkozok-hangok" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Eszközök és hangok</Link>
                         </div>
                       )}
                    </div>

                    <div className="relative group" 
                         onMouseEnter={() => setServicesOpen(true)} 
                         onMouseLeave={() => setServicesOpen(false)}
                         onClick={() => setServicesOpen(!servicesOpen)}
                    >
                       <button className={navLinkClass}>
                          SZOLGÁLTATÁSOK
                          <img src="/assets/arrow_mini.svg" className={`w-[10px] ml-2 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} alt=""/>
                       </button>
                       {servicesOpen && (
                         <div className="absolute top-full left-1/2 -translate-x-1/2 w-[240px] bg-brand-bronze/95 backdrop-blur-md border border-white/10 rounded-xl py-4 shadow-2xl z-50 flex flex-col items-center gap-2">
                           <Link href="/rolam" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Rólam</Link>
                           <Link href="/media" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Média megjelenések</Link>
                           <Link href="/alkalmazasi-terulet" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Alkalmazási terület</Link>
                           <Link href="/menete" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Hangtálmasszázs® menete</Link>
                           <Link href="/arak" className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors">Árak</Link>
                         </div>
                       )}
                    </div>
                    
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
        <div className="xl:hidden relative flex items-start justify-between h-[90px] px-4 pt-4">
          <img src="/assets/menu-mobile.svg" alt="" className="absolute left-0 top-[-20px] h-[113px] w-full max-w-none backdrop-blur-[3px] -z-10 mix-blend-normal object-cover object-top" />
           <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 z-50 relative border border-white/20 rounded-full bg-brand-white/50 backdrop-blur-sm">
             {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
          
          <div className="relative flex justify-center flex-1">
             <Link href="/" className="absolute top-[20px] left-1/2 -ml-[-32px] -translate-x-1/2 z-50">
                <img src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" alt="Hangakadémia" className="h-[160px] w-auto drop-shadow-md max-w-none" />
             </Link>
          </div>
          
          <div className="flex items-center gap-2 z-50">
             <div className="relative">
                <button 
                   onClick={() => setLangOpen(!langOpen)}
                   className="p-2 border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm text-[10px] uppercase tracking-widest text-white w-10 h-10 flex items-center justify-center font-light"
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
              <Link href="/shop" className="p-2 border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm w-10 h-10 flex items-center justify-center">
                 <img src="/assets/icons-cart.svg" className="w-5" alt="Shop"/>
              </Link>
          </div>
       </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute top-[0px] left-0 w-full bg-brand-bronze/98 backdrop-blur-xl p-6 pt-24 flex flex-col gap-4 shadow-xl z-[60] text-brand-white h-screen overflow-y-auto">
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-4 left-4 p-2 z-[70] border border-white/20 rounded-full bg-brand-bronze/50 backdrop-blur-sm"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col">
                <button 
                  onClick={() => setHhmOpen(!hhmOpen)}
                  className="font-playfair text-lg text-center border-b border-white/10 pb-2 flex items-center justify-center gap-2"
                >
                  HANGTÁL MASSZÁZS
                  <img src="/assets/arrow_mini-white.svg" className={`w-[10px] transition-transform ${hhmOpen ? 'rotate-180' : ''}`} alt=""/>
                </button>
                {hhmOpen && (
                  <div className="flex flex-col gap-3 py-4 bg-white/5 mt-1 rounded-lg">
                    <Link href="/hangterapia" className="text-center text-sm font-poppins hover:text-white/80">Hangterápia</Link>
                    <Link href="/hangtalak" className="text-center text-sm font-poppins hover:text-white/80">Himalájai hangtálak</Link>
                    <Link href="/hangtal-masszazs" className="text-center text-sm font-poppins hover:text-white/80 font-bold">Himalájai Hangtálmasszázs®</Link>
                    <Link href="/tudomanyos-alapok" className="text-center text-sm font-poppins hover:text-white/80">Tudományos alapok</Link>
                    <Link href="/eszkozok-hangok" className="text-center text-sm font-poppins hover:text-white/80">Eszközök és hangok</Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <button 
                  onClick={() => setServicesOpen(!servicesOpen)}
                  className="font-playfair text-lg text-center border-b border-white/10 pb-2 flex items-center justify-center gap-2"
                >
                  SZOLGÁLTATÁSOK
                  <img src="/assets/arrow_mini-white.svg" className={`w-[10px] transition-transform ${servicesOpen ? 'rotate-180' : ''}`} alt=""/>
                </button>
                {servicesOpen && (
                  <div className="flex flex-col gap-3 py-4 bg-white/5 mt-1 rounded-lg">
                    <Link href="/rolam" className="text-center text-sm font-poppins hover:text-white/80">Rólam</Link>
                    <Link href="/media" className="text-center text-sm font-poppins hover:text-white/80">Média megjelenések</Link>
                    <Link href="/alkalmazasi-terulet" className="text-center text-sm font-poppins hover:text-white/80">Alkalmazási terület</Link>
                    <Link href="/menete" className="text-center text-sm font-poppins hover:text-white/80">Hangtálmasszázs® menete</Link>
                    <Link href="/arak" className="text-center text-sm font-poppins hover:text-white/80">Árak</Link>
                  </div>
                )}
              </div>

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
