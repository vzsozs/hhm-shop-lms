'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Search as ZoomIn } from 'lucide-react';
import { useLanguage } from '../../../context/language-context';
import { Language } from '../../../modules/shared/lib/i18n-constants';

const GALLERY_IMAGES = [
  { src: '/images/Hangakademia-03.webp', alt: 'Hangakadémia 03' },
  { src: '/images/Hangakademia-04.webp', alt: 'Hangakadémia 04' },
  { src: '/images/Hangakademia-05.webp', alt: 'Hangakadémia 05' },
  { src: '/images/Hangakademia-17.webp', alt: 'Hangakadémia 17' },
  { src: '/images/harang.webp', alt: 'Harang' },
  { src: '/images/Hangakademia-19.webp', alt: 'Hangakadémia 19' },
  { src: '/images/Hangakademia-20.webp', alt: 'Hangakadémia 20' },
  { src: '/images/Hangakademia-22.webp', alt: 'Hangakadémia 22' },
  { src: '/images/Hangakademia-24.webp', alt: 'Hangakadémia 24' },
  { src: '/images/Hangakademia-23.webp', alt: 'Hangakadémia 23' },
  { src: '/images/Hangakademia-25.webp', alt: 'Hangakadémia 25' },
  { src: '/images/Hangakademia-28.webp', alt: 'Hangakadémia 28' },
  { src: '/images/Hangakademia-26.webp', alt: 'Hangakadémia 26' },
  { src: '/images/Hangakademia-27.webp', alt: 'Hangakadémia 27' },
  { src: '/images/Hangakademia-29.webp', alt: 'Hangakadémia 29' },
  { src: '/images/Hangakademia-32.webp', alt: 'Hangakadémia 32' },
  { src: '/images/Hangakademia-33.webp', alt: 'Hangakadémia 33' },
  { src: '/images/Hangakademia-31.webp', alt: 'Hangakadémia 31' },
  { src: '/images/Hangakademia-30.webp', alt: 'Hangakadémia 30' },
  { src: '/images/Hangakademia-34.webp', alt: 'Hangakadémia 34' },
  { src: '/images/Hangakademia-35.webp', alt: 'Hangakadémia 35' },
  { src: '/images/Hangakademia-36.webp', alt: 'Hangakadémia 36' },
  { src: '/images/Hangakademia-37.webp', alt: 'Hangakadémia 37' },
];

export default function GalleryPage() {
  const { language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const dict: Record<Language, {
    title: string;
    subtitle: string;
    close: string;
  }> = {
    hu: {
      title: "Galéria",
      subtitle: "Pillanatok a Hangakadémia életéből",
      close: "Bezárás",
    },
    en: {
      title: "Gallery",
      subtitle: "Moments from the life of the Sound Academy",
      close: "Close",
    },
    sk: {
      title: "Galéria",
      subtitle: "Momenty zo života Zvukovej akadémie",
      close: "Zatvoriť",
    }
  };

  const t = dict[language as Language] || dict.hu;

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);
  
  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % GALLERY_IMAGES.length);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-16 px-4 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-16 space-y-4 text-center">
        <h1 className="font-cormorant text-5xl md:text-6xl lg:text-7xl text-brand-brown tracking-tight font-bold">
          {t.title}
        </h1>
        <p className="text-xl text-brand-black/60 font-cormorant italic">
          {t.subtitle}
        </p>
        <div className="w-24 h-px bg-brand-bronze/30 mx-auto mt-6"></div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {GALLERY_IMAGES.map((img, index) => (
          <div 
            key={index} 
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-bronze/5 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-brand-bronze/10"
            onClick={() => openLightbox(index)}
          >
            <Image 
              src={img.src} 
              alt={img.alt} 
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-brand-brown/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <ZoomIn className="text-white w-6 h-6" />
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
            onClick={closeLightbox}
          >
            <X size={32} />
          </button>

          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
            onClick={showPrev}
          >
            <ChevronLeft size={48} />
          </button>

          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <Image 
              src={GALLERY_IMAGES[selectedImage].src} 
              alt={GALLERY_IMAGES[selectedImage].alt} 
              fill
              className="object-contain shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
              sizes="100vw"
              priority
            />
          </div>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
            onClick={showNext}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 font-montserrat text-sm">
            {selectedImage + 1} / {GALLERY_IMAGES.length}
          </div>
        </div>
      )}
    </div>
  );
}
