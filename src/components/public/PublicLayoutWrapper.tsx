'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function PublicLayoutWrapper({
  children,
  header,
  footer,
  fonts
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  fonts: string;
}) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    if (isHome) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isHome]);

  return (
    <div className={`min-h-screen bg-brand-lightbg text-brand-black ${fonts} font-montserrat text-[14px] ${isHome ? 'h-screen overflow-hidden' : ''}`}>
      {header}
      <main className={isHome ? 'h-0 overflow-hidden' : 'min-h-screen'}>
        {children}
      </main>
      {!isHome && footer}
    </div>
  );
}
