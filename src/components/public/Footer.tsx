import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-bronze text-brand-lightbg py-12 flex flex-col items-center">
      <div className="mb-8">
        <Link href="/">
          <img src="/assets/PalAdri-logo-2023-Vegleges-vilagos.svg" alt="Hangakadémia" className="h-[120px] w-auto drop-shadow-md" />
        </Link>
      </div>
      
      <div className="flex gap-4 mb-12">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <img src="/assets/ico-facebook.svg" alt="Facebook" className="w-4 h-4 object-contain opacity-90" />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <img src="/assets/ico-youtube.svg" alt="YouTube" className="w-4 h-4 object-contain opacity-90" />
        </a>
        <a href="tel:+36301234567" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <img src="/assets/ico-phone.svg" alt="Phone" className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
        </a>
        <a href="mailto:info@hangakademia.hu" className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
           <img src="/assets/ico-mail.svg" alt="Email" className="w-4 h-4 object-contain opacity-90 hover:opacity-100" />
        </a>
      </div>
      
      <div className="w-full max-w-4xl border-t border-white/20 pt-6 flex flex-col md:flex-row justify-between items-center px-4 md:px-0 gap-4" style={{ fontFamily: 'var(--font-poppins)', fontSize: '12px', color: '#e7d2d2' }}>
        <span>Copyright © 2006 Hangakadémia® /Zvuková Akademia s.r.o.. All rights reserved.</span>
        <div className="flex gap-6">
          <Link href="/adatvedelmi-tajekoztato" className="hover:text-white flex items-center gap-2 transition-colors">
            <img src="/assets/icon-doc.svg" alt="Doc" className="w-3" />
            Adatvédelmi tájékoztató
          </Link>
          <Link href="/jogi-nyilatkozat" className="hover:text-white flex items-center gap-2 transition-colors">
            <img src="/assets/icon-doc.svg" alt="Doc" className="w-3" />
            Jogi nyilatkozat
          </Link>
        </div>
      </div>
    </footer>
  );
}
