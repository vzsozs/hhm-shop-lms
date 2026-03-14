
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavMenuProps } from './header-types';

interface SubmenuItem {
  href: string;
  label: string;
}

interface NavSubmenuProps extends NavMenuProps {
  label: React.ReactNode;
  items: SubmenuItem[];
  className: string;
}

export const NavSubmenu: React.FC<NavSubmenuProps> = ({ 
  label, 
  items, 
  isOpen, 
  onToggle, 
  className 
}) => {
  return (
    <div 
      className="relative group" 
      onMouseEnter={() => onToggle(true)} 
      onMouseLeave={() => onToggle(false)}
      onClick={() => onToggle(!isOpen)}
    >
      <button className={className}>
        {label}
        <Image 
          src="/assets/arrow_mini.svg" 
          width={10} 
          height={10} 
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          alt=""
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-[280px] bg-brand-bronze/95 backdrop-blur-md border border-white/10 rounded-xl py-4 shadow-2xl z-50 flex flex-col items-center gap-2">
          {items.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="w-full text-center px-4 py-2 text-white hover:bg-white/10 font-playfair transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
