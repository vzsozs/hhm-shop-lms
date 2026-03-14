import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-bronze text-brand-lightbg py-12 flex flex-col items-center">
      <div className="mb-8">
        <Link href="/">
          <Image 
            src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" 
            alt="Hangakadémia" 
            height={120} 
            width={180} 
            className="h-[120px] w-auto drop-shadow-md" 
          />
        </Link>
      </div>
      
      <div className="flex gap-4 mb-12">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <Image src="/assets/ico-facebook.svg" alt="Facebook" width={16} height={16} className="w-4 h-4 object-contain opacity-90" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <Image src="/assets/ico-youtube.svg" alt="YouTube" width={16} height={16} className="w-4 h-4 object-contain opacity-90" />
        </a>
        <a href="tel:+36301234567" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <Image src="/assets/ico-phone.svg" alt="Phone" width={16} height={16} className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
        </a>
        <a href="mailto:info@hangakademia.hu" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <Image src="/assets/ico-mail.svg" alt="Email" width={16} height={16} className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
        </a>
      </div>
      
      <div className="w-full max-w-4xl border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center px-4 md:px-0 gap-4" style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px', color: '#e7d2d2' }}>
        <span>Copyright © 2006 Hangakadémia® /Zvuková Akademia s.r.o.. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/adatvedelmi-tajekoztato" className="hover:text-white flex items-center gap-2 transition-colors">
            <Image src="/assets/icon-doc.svg" alt="Doc" width={12} height={12} className="w-3 h-auto" />
            Adatvédelmi tájékoztató
          </Link>
          <Link href="/jogi-nyilatkozat" className="hover:text-white flex items-center gap-2 transition-colors">
            <Image src="/assets/icon-doc.svg" alt="Doc" width={12} height={12} className="w-3 h-auto" />
            Jogi nyilatkozat
          </Link>
        </div>
      </div>
    </footer>
  );
}
