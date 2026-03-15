'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { Newspaper, Tv, X, ChevronLeft, ChevronRight, Search as ZoomIn } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'news' | 'tv';
  date: string;
  title: string;
  description: string;
  images?: string[];
  videoUrl?: string;
  thumbnail?: string;
}

export default function MediaPage() {
  const { language } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const dict: Record<Language, {
    title: string;
    mediaItems: MediaItem[];
    close: string;
  }> = {
    hu: {
      title: "Média megjelenések",
      close: "Bezárás",
      mediaItems: [
        {
          id: '1',
          type: 'news',
          date: '2023 December 29.',
          title: 'Természetgyógyász magazin',
          description: 'Varázslatos hangok segítenek a gyógyulásban!',
          images: ['/images/Termeszetgyogyasz_magazin-01.webp', '/images/Termeszetgyogyasz_magazin-02.webp']
        },
        {
          id: '2',
          type: 'tv',
          date: '2016 Március 01.',
          title: 'TV2',
          description: 'Bizonyíték: Frekvenciák pozitív hatása az emberi szervezetre.',
          videoUrl: 'https://www.youtube.com/embed/vrj6jAPQdac',
          thumbnail: '/images/Video-01.webp'
        },
        {
          id: '3',
          type: 'tv',
          date: '2015 Szeptember 12.',
          title: 'TV2 - SV',
          description: 'Hangterápia bemutatása',
          videoUrl: 'https://www.youtube.com/embed/bl2aQwoze7M',
          thumbnail: '/images/Video-02.webp'
        },
        {
          id: '4',
          type: 'news',
          date: '2010 Május 13.',
          title: 'Blikk nők (Gyerekek)',
          description: 'Hangterápia csodás lehetőség a gyerekeknek a hangok világának felfedezésére és élményszerzésre. Hangtálak és különleges hangszerek varázslatos hangjai nemcsak lenyűgözik őket, de segítenek megnyugodni, kikapcsolódni és érzelmileg is kiegyensúlyozottá válni.',
          images: ['/images/BlikkNok-Gyerekek.webp']
        },
        {
          id: '5',
          type: 'news',
          date: '2010 Március 22.',
          title: 'Blikk nők (Egészség)',
          description: 'A hangtálmasszázs a test és elme harmóniáját célozza meg az emberi szervezet számára. A hangszerek rezgései stresszcsökkentést és belső egyensúlyt hoznak, segítve a relaxációt és az egészség fenntartását hosszú távon.',
          images: ['/images/BlikkNok-Egeszseg.webp']
        },
        {
          id: '6',
          type: 'news',
          date: '2012 Május 12.',
          title: 'Gyógyító érintések - hangok rezgései',
          description: 'Ismerd meg, hogyan hatnak a hangok rezgései a testre és a lélekre.',
          images: ['/images/Gyogyito.webp']
        }
      ]
    },
    en: {
      title: "Media Appearances",
      close: "Close",
      mediaItems: [
        {
          id: '1',
          type: 'news',
          date: 'December 29, 2023',
          title: 'Naturopath Magazine',
          description: 'Magical sounds helping in healing!',
          images: ['/images/Termeszetgyogyasz_magazin-01.webp', '/images/Termeszetgyogyasz_magazin-02.webp']
        },
        {
          id: '2',
          type: 'tv',
          date: 'March 1, 2016',
          title: 'TV2',
          description: 'Evidence: The positive effect of frequencies on the human body.',
          videoUrl: 'https://www.youtube.com/embed/vrj6jAPQdac',
          thumbnail: '/images/Video-01.webp'
        },
        {
          id: '3',
          type: 'tv',
          date: 'September 12, 2015',
          title: 'TV2 - SV',
          description: 'Introduction to Sound Therapy',
          videoUrl: 'https://www.youtube.com/embed/bl2aQwoze7M',
          thumbnail: '/images/Video-02.webp'
        },
        {
          id: '4',
          type: 'news',
          date: 'May 13, 2010',
          title: 'Blikk Women (Children)',
          description: 'Sound therapy is a wonderful opportunity for children to explore the world of sounds and gain experiences. The magical sounds of singing bowls and special instruments not only fascinate them but also help them calm down and relax.',
          images: ['/images/BlikkNok-Gyerekek.webp']
        },
        {
          id: '5',
          type: 'news',
          date: 'March 22, 2010',
          title: 'Blikk Women (Health)',
          description: 'Singing bowl massage aims for the harmony of body and mind for the human organism. The vibrations of the instruments bring stress reduction and inner balance, helping relaxation.',
          images: ['/images/BlikkNok-Egeszseg.webp']
        },
        {
          id: '6',
          type: 'news',
          date: 'May 12, 2012',
          title: 'Healing Touches - Vibrations of Sounds',
          description: 'Discover how sound vibrations affect the body and soul.',
          images: ['/images/Gyogyito.webp']
        }
      ]
    },
    sk: {
      title: "Mediálne vystúpenia",
      close: "Zatvoriť",
      mediaItems: [
        {
          id: '1',
          type: 'news',
          date: '29. decembra 2023',
          title: 'Časopis Prírodný liečiteľ',
          description: 'Magické zvuky pomáhajú pri liečení!',
          images: ['/images/Termeszetgyogyasz_magazin-01.webp', '/images/Termeszetgyogyasz_magazin-02.webp']
        },
        {
          id: '2',
          type: 'tv',
          date: '1. marca 2016',
          title: 'TV2',
          description: 'Dôkaz: Pozitívny vplyv frekvencií na ľudský organizmus.',
          videoUrl: 'https://www.youtube.com/embed/vrj6jAPQdac',
          thumbnail: '/images/Video-01.webp'
        },
        {
          id: '3',
          type: 'tv',
          date: '12. septembra 2015',
          title: 'TV2 - SV',
          description: 'Predstavenie zvukovej terapie',
          videoUrl: 'https://www.youtube.com/embed/bl2aQwoze7M',
          thumbnail: '/images/Video-02.webp'
        },
        {
          id: '4',
          type: 'news',
          date: '13. mája 2010',
          title: 'Blikk nők (Deti)',
          description: 'Zvuková terapia je pre deti úžasnou príležitosťou na objavovanie sveta zvukov a získavanie zážitkov. Magické zvuky spievajúcich mís a špeciálnych nástrojov ich nielen fascinujú, ale pomáhajú im sa upokojiť.',
          images: ['/images/BlikkNok-Gyerekek.webp']
        },
        {
          id: '5',
          type: 'news',
          date: '22. marca 2010',
          title: 'Blikk nők (Zdravie)',
          description: 'Masáž spievajúcimi misami sa zameriava na harmóniu tela a mysle pre ľudský organizmus. Vibrácie nástrojov prinášajú zníženie stresu a vnútornú rovnováhu.',
          images: ['/images/BlikkNok-Egeszseg.webp']
        },
        {
          id: '6',
          type: 'news',
          date: '12. mája 2012',
          title: 'Liečivé dotyky - vibrácie zvukov',
          description: 'Zistite, ako zvukové vibrácie ovplyvňujú telo a dušu.',
          images: ['/images/Gyogyito.webp']
        }
      ]
    }
  };

  const t = dict[language as Language] || dict.hu;

  // Collect all images for global navigation
  const allMediaImages = useMemo(() => {
    return t.mediaItems.flatMap(item => 
      (item.images || []).map(src => ({ src, title: item.title }))
    );
  }, [t.mediaItems]);

  const openLightbox = (imageSrc: string) => {
    const index = allMediaImages.findIndex(img => img.src === imageSrc);
    if (index !== -1) setSelectedImageIndex(index);
  };

  const closeLightbox = () => setSelectedImageIndex(null);

  const showPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + allMediaImages.length) % allMediaImages.length);
    }
  };

  const showNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % allMediaImages.length);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <section className="py-20 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Decorative Logo */}
          <div className="flex justify-center mb-16">
            <div className="relative w-32 h-32 opacity-80">
              <Image 
                src="/images/PalAdri-logo-stroke.svg" 
                alt="Logo" 
                fill 
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-24">
            {t.mediaItems.map((item) => (
              <div key={item.id} className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 group">
                {/* Date line & Icon */}
                <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end gap-4 lg:text-right">
                  <div className="text-brand-bronze font-montserrat text-sm uppercase tracking-widest font-medium order-2 lg:order-1">
                    {item.date}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-brand-bronze/10 flex items-center justify-center text-brand-bronze order-1 lg:order-2 group-hover:bg-brand-brown group-hover:text-white transition-all duration-500 shadow-sm border border-brand-bronze/10">
                    {item.type === 'news' ? <Newspaper size={20} /> : <Tv size={20} />}
                  </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-9 space-y-6">
                  <h2 className="font-cormorant text-3xl md:text-4xl text-brand-brown font-bold tracking-tight">
                    {item.title}
                  </h2>
                  <p className="text-lg text-brand-black/70 font-playfair leading-relaxed italic border-l-2 border-brand-bronze/30 pl-6 py-1">
                    {item.description}
                  </p>

                  {/* Media (Images/Video) */}
                  <div className="space-y-6 pt-4">
                    {item.images && item.images.length > 0 && (
                      <div className={`grid gap-4 ${item.images.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                        {item.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="group/img relative aspect-[3/4] md:aspect-auto md:h-[600px] overflow-hidden rounded-2xl shadow-xl border border-brand-bronze/10 transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in"
                            onClick={() => openLightbox(img)}
                          >
                            <Image 
                              src={img} 
                              alt={`${item.title} - ${idx + 1}`} 
                              fill 
                              className="object-cover md:object-contain bg-brand-lightbg/50 transition-transform duration-700 group-hover/img:scale-105"
                              sizes="(max-width: 768px) 100vw, 800px"
                            />
                            <div className="absolute inset-0 bg-brand-brown/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transform translate-y-4 group-hover/img:translate-y-0 transition-transform duration-500">
                                  <ZoomIn className="text-white w-6 h-6" />
                               </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.videoUrl && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl border border-brand-bronze/10 group/video bg-black">
                        <iframe 
                          src={item.videoUrl} 
                          title={item.title} 
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Divider Line for Desktop */}
                <div className="hidden lg:block absolute left-[calc(25%-1.5rem)] top-16 bottom-[-3rem] w-px bg-gradient-to-b from-brand-bronze/30 via-brand-bronze/10 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImageIndex !== null && (
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

          <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-full">
              <Image 
                src={allMediaImages[selectedImageIndex].src} 
                alt={allMediaImages[selectedImageIndex].title} 
                fill
                className="object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
                sizes="100vw"
                priority
              />
            </div>
            <div className="absolute -bottom-10 left-0 right-0 text-center">
               <p className="text-white font-cormorant text-xl tracking-wide">{allMediaImages[selectedImageIndex].title}</p>
            </div>
          </div>

          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-2 bg-white/5 rounded-full hover:bg-white/10 z-[110]"
            onClick={showNext}
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 font-montserrat text-sm">
            {selectedImageIndex + 1} / {allMediaImages.length}
          </div>
        </div>
      )}
    </div>
  );
}
