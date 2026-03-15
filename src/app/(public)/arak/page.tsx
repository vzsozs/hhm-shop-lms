'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';
import { Language } from '@/modules/shared/lib/i18n-constants';
import { Clock, ShoppingCart, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PricingItem {
  id: string;
  title: string;
  description: string;
  time: string;
  price: string;
  image: string;
  priceNote?: string;
  secondPrice?: string;
  secondPriceNote?: string;
}

export default function PricingPage() {
  const { language } = useLanguage();
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const handleAddToCart = (id: string) => {
    setAddedItems(prev => new Set(prev).add(id));
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const dict: Record<Language, {
    intro_title: string;
    intro_text: string;
    time_label: string;
    add_to_cart: string;
    added_to_cart: string;
    currency: string;
    legal_notice: string;
    copyright: string;
    items: PricingItem[];
  }> = {
    hu: {
      intro_title: "Himalájai Hangtálmasszázs® árak és információk",
      intro_text: "A Himalájai hangtálak különleges hangzásvilága segít megteremteni egy olyan teret, ahol a figyelem finoman lelassul, a test ellazul, és egy nyugodt, befogadó állapot alakul ki. Ez az élmény egy csendes, kiegyensúlyozott belső tér felé kíséri a résztvevőt — minden alkalom egy újfajta találkozás önmagunkkal.",
      time_label: "Időtartam",
      add_to_cart: "Kosárba",
      added_to_cart: "Kosárba került",
      currency: ".-Ft",
      legal_notice: "Hangakadémia® - Jogi nyilatkozat",
      copyright: "© HangAkadémia® – Minden jog fenntartva. A tartalom szerzői jogvédelem alatt áll.",
      items: [
        {
          id: '1',
          title: "Himalájai Hangtálmasszázs® ”duplex és triplex” hangtálakkal",
          description: "Személyre szabott hangzásélmény. A folyamatban 15–21 darab, különböző karakterű hangtál és többféle idiofon hangszer hangja kapcsolódik össze finom, egymásra épülő rétegekben.",
          time: "max. 120 perc",
          price: "28.000",
          image: "/images/01.webp"
        },
        {
          id: '2',
          title: "Tibeti és védikus aura,-csakra harmonizálás",
          description: "Tibeti és védikus hangrendszer szerinti hangtálmasszázs (7-9 db hangtállal).",
          time: "max. 60 perc",
          price: "20.000",
          image: "/images/02.webp"
        },
        {
          id: '3',
          title: "Himalájai csakra és meridián Hangtálmasszázs®",
          description: "Solfeggio hangtálak helyes használata meridiánokon (7-9 db hangtállal).",
          time: "max. 60 perc",
          price: "20.000",
          image: "/images/03.webp"
        },
        {
          id: '4',
          title: "Lokális, helyi területek energetizálása",
          description: "Különböző 3-5 db hangtálakkal, és különböző idiofon hangszerekkel a helyi területek harmonizálására.",
          time: "max. 45 perc",
          price: "15.000",
          image: "/images/04.webp"
        },
        {
          id: '5',
          title: "Himalájai kéz és láb hangtálfürdő",
          description: "Mikrorendszerek vizes átrezgetése gyógynövényekkel (3 db tállal).",
          time: "max. 45 perc",
          price: "15.000",
          image: "/images/05.webp"
        },
        {
          id: '6',
          title: "Himalájai csakra talp és láb hangtálfürdő + frekvencia masszázs",
          description: "Teljes vizes lábfürdő gyógynövényekkel, csakra frekvenciákkal.",
          time: "max. 90 perc",
          price: "22.500",
          image: "/images/06.webp"
        },
        {
          id: '7',
          title: "Himalájai reflexzónás talp és láb hangtálfürdő + frekvencia masszázs",
          description: "Teljes vizes lábfürdő, és masszázs legfontosabb szerveink frekvenciáival.",
          time: "max. 90 perc",
          price: "22.500",
          image: "/images/07.webp"
        },
        {
          id: '8',
          title: "Himalájai csakra kéz és kar hangtálfürdő + frekvencia masszázs",
          description: "Teljes vizes kézfürdő gyógynövényekkel, csakra frekvenciákkal.",
          time: "max. 90 perc",
          price: "22.500",
          image: "/images/08.webp"
        },
        {
          id: '9',
          title: "Himalájai szervi reflexzónás kéz és kar hangtálfürdő + frekvencia masszázs",
          description: "Teljes vizes kézfürdő, és masszázs legfontosabb szerveink frekvenciáival.",
          time: "max. 90 perc",
          price: "22.500",
          image: "/images/09.webp"
        },
        {
          id: '10',
          title: "Himalájai arc és fejmasszázs frekvenciákkal",
          description: "A dekoltázs, arc, fej, skalp, fül, nyak átmasszírozása megfelelő frekvenciákkal.",
          time: "max. 90 perc",
          price: "22.500",
          image: "/images/10.webp"
        },
        {
          id: '11',
          title: "Gyermek és kamasz Himalájai hangtálmasszázs®",
          description: "Speciális figyelem a fiatalabb korosztálynak (17 éves korig), 1-21 db hangtállal.",
          time: "max. 50 perc",
          price: "18.000",
          image: "/images/11.webp"
        },
        {
          id: '12',
          title: "Páros (összehangoló) Himalájai hangtálmasszázs®",
          description: "Anya + gyermek, párkapcsolati, baráti vagy munkatársi harmonizálás.",
          time: "max. 120 perc",
          price: "22.500",
          priceNote: "szülő + gyermek (18 éves korig)",
          secondPrice: "28.000",
          secondPriceNote: "egyéb páros",
          image: "/images/12.webp"
        },
        {
          id: '13',
          title: "Irodai (manager) székes Himalájai hangtálmasszázs®",
          description: "Hátizmok teljes gyors kilazítása, felfrissítése. Cégeknek is kérhető.",
          time: "max. 45 perc",
          price: "15.000",
          image: "/images/PalAdri-logo-stroke-padding.svg"
        }
      ]
    },
    en: {
      intro_title: "Himalayan Singing Bowl Massage® Prices",
      intro_text: "The unique soundscape of Himalayan singing bowls helps create a space where attention subtly slows down, the body relaxes, and a calm, receptive state emerges.",
      time_label: "Duration",
      add_to_cart: "Add to cart",
      added_to_cart: "Added",
      currency: " €",
      legal_notice: "Hangakadémia® - Legal Notice",
      copyright: "© HangAkadémia® – All rights reserved. Content protected by copyright.",
      items: [
        { id: '1', title: "Himalayan Singing Bowl Massage® with 'duplex & triplex' bowls", description: "Personalized sound experience using 15-21 different bowls and idiophone instruments.", time: "max. 120 min", price: "70", image: "/images/01.webp" },
        { id: '2', title: "Tibetan and Vedic Aura-Chakra Harmonization", description: "Singing bowl massage according to Tibetan and Vedic sound systems.", time: "max. 60 min", price: "50", image: "/images/02.webp" },
        { id: '3', title: "Himalayan Chakra and Meridian Singing Bowl Massage®", description: "Correct use of Solfeggio bowls on meridians.", time: "max. 60 min", price: "50", image: "/images/03.webp" },
        { id: '4', title: "Local Area Energizing", description: "Harmonizing local areas with 3-5 bowls.", time: "max. 45 min", price: "37.5", image: "/images/04.webp" },
        { id: '5', title: "Himalayan Hand and Foot Bowl Bath", description: "Vibration of microsystems with herbs.", time: "max. 45 min", price: "37.5", image: "/images/05.webp" },
        { id: '6', title: "Himalayan Chakra Foot Bath + Frequency Massage", description: "Full herbal foot bath with chakra frequencies.", time: "max. 90 min", price: "56.25", image: "/images/06.webp" },
        { id: '7', title: "Himalayan Reflexology Foot Bath + Frequency Massage", description: "Full foot bath with organ frequencies.", time: "max. 90 min", price: "56.25", image: "/images/07.webp" },
        { id: '8', title: "Himalayan Chakra Hand Bath + Frequency Massage", description: "Full herbal hand bath with chakra frequencies.", time: "max. 90 min", price: "56.25", image: "/images/08.webp" },
        { id: '9', title: "Himalayan Reflexology Hand Bath + Frequency Massage", description: "Full hand bath with organ frequencies.", time: "max. 90 min", price: "56.25", image: "/images/09.webp" },
        { id: '10', title: "Himalayan Face and Head Massage with Frequencies", description: "Massage of décolleté, face, head, ears, neck.", time: "max. 90 min", price: "56.25", image: "/images/10.webp" },
        { id: '11', title: "Child and Teenager Himalayan Singing Bowl Massage®", description: "Special attention for the younger generation (up to 17 years).", time: "max. 50 min", price: "45", image: "/images/11.webp" },
        { id: '12', title: "Partner Himalayan Singing Bowl Massage®", description: "Harmonization for parent+child or partners.", time: "max. 120 min", price: "56.25", priceNote: "parent + child", secondPrice: "70", secondPriceNote: "other partners", image: "/images/12.webp" },
        { id: '13', title: "Office Chair Himalayan Singing Bowl Massage®", description: "Quick relaxation of back muscles. Also for companies.", time: "max. 45 min", price: "37.5", image: "/images/PalAdri-logo-stroke-padding.svg" }
      ]
    },
    sk: {
      intro_title: "Ceny himalájskych spievajúcich mís®",
      intro_text: "Jedinečná zvuková krajina himalájskych spievajúcich mís pomáha vytvoriť priestor, kde sa pozornosť jemne spomaľuje, telo sa uvoľňuje a vzniká pokojný, vnímavý stav.",
      time_label: "Trvanie",
      add_to_cart: "Do košíka",
      added_to_cart: "Pridané",
      currency: " €",
      legal_notice: "Hangakadémia® - Právne vyhlásenie",
      copyright: "© HangAkadémia® – Všetky práva vyhradené. Obsah je chránený autorským právom.",
      items: [
        { id: '1', title: "Himalájska masáž spievajúcimi misami® s misami 'duplex & triplex'", description: "Personalizovaný zvukový zážitok s použitím 15-21 rôznych mís.", time: "max. 120 min", price: "70", image: "/images/01.webp" },
        { id: '2', title: "Tibetansko-védska harmonizácia aury a čakier", description: "Masáž spievajúcimi misami podľa tibetských a védskych zvukových systémov.", time: "max. 60 min", price: "50", image: "/images/02.webp" },
        { id: '3', title: "Himalájska čakrová a meridiánová masáž®", description: "Správne používanie Solfeggio mís na meridiánoch.", time: "max. 60 min", price: "50", image: "/images/03.webp" },
        { id: '4', title: "Energizácia lokálnej oblasti", description: "Harmonizácia lokálnych oblastí s 3-5 misami.", time: "max. 45 min", price: "37.5", image: "/images/04.webp" },
        { id: '5', title: "Himalájsky kúpeľ rúk a nôh v spievajúcich misách", description: "Vibrácie mikrosystémov s bylinkami.", time: "max. 45 min", price: "37.5", image: "/images/05.webp" },
        { id: '6', title: "Himalájsky čakrový kúpeľ nôh + frekvenčná masáž", description: "Plný bylinný kúpeľ nôh s čakrovými frekvenciami.", time: "max. 90 min", price: "56.25", image: "/images/06.webp" },
        { id: '7', title: "Himalájsky reflexologický kúpeľ nôh + frekvenčná masáž", description: "Kúpeľ nôh s orgánovými frekvenciami.", time: "max. 90 min", price: "56.25", image: "/images/07.webp" },
        { id: '8', title: "Himalájsky čakrový kúpeľ rúk + frekvenčná masáž", description: "Bylinný kúpeľ rúk s čakrovými frekvenciami.", time: "max. 90 min", price: "56.25", image: "/images/08.webp" },
        { id: '9', title: "Himalájsky reflexologický kúpeľ rúk + frekvenčná masáž", description: "Kúpeľ rúk s orgánovými frekvenciami.", time: "max. 90 min", price: "56.25", image: "/images/09.webp" },
        { id: '10', title: "Himalájska masáž tváre a hlavy s frekvenciami", description: "Masáž dekoltu, tváre, hlavy, uší a krku.", time: "max. 90 min", price: "56.25", image: "/images/10.webp" },
        { id: '11', title: "Masáž spievajúcimi misami pre deti a mládež®", description: "Špeciálna pozornosť pre mladšiu generáciu (do 17 rokov).", time: "max. 50 min", price: "45", image: "/images/11.webp" },
        { id: '12', title: "Partnerská himalájska masáž spievajúcimi misami®", description: "Harmonizácia pre rodičov s deťmi alebo partnerov.", time: "max. 120 min", price: "56.25", priceNote: "rodič + dieťa", secondPrice: "70", secondPriceNote: "ostatní partneri", image: "/images/12.webp" },
        { id: '13', title: "Kancelárska masáž himalájskymi spievajúcimi misami®", description: "Rýchle uvoľnenie svalov chrbta. Aj pre firmy.", time: "max. 45 min", price: "37.5", image: "/images/PalAdri-logo-stroke-padding.svg" }
      ]
    }
  };

  const t = dict[language as Language] || dict.hu;

  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      {/* Intro Section */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-12">
            <Image src="/images/PalAdri-logo-stroke.svg" alt="Logo" width={100} height={100} className="opacity-80" />
          </div>
          <h2 className="font-cormorant text-4xl md:text-5xl text-brand-brown font-bold mb-8 tracking-tight">
            {t.intro_title}
          </h2>
          <p className="text-xl text-brand-black/70 font-playfair max-w-3xl mx-auto leading-relaxed">
            {t.intro_text}
          </p>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-24 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.items.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-brand-bronze/10 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col">
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Content Section */}
                <div className="p-8 flex-grow flex flex-col">
                  <div className="flex-grow">
                    <h3 className="font-cormorant text-2xl text-brand-brown font-bold mb-4 leading-tight group-hover:text-brand-sienna transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-brand-black/60 font-montserrat text-sm mb-6 line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-brand-bronze/10">
                    <div className="flex items-center gap-2 text-brand-bronze">
                      <Clock size={16} />
                      <span className="text-xs uppercase tracking-widest font-bold">{t.time_label}: {item.time}</span>
                    </div>

                    <div className="space-y-2">
                       {item.priceNote && <p className="text-[10px] uppercase tracking-tighter text-brand-black/40 font-bold">{item.priceNote}</p>}
                       <div className="flex items-end justify-between gap-4">
                         <div className="font-cormorant text-3xl text-brand-brown font-bold">
                           {item.price}{t.currency}
                         </div>
                         <Button 
                           onClick={() => handleAddToCart(item.id)}
                           variant={addedItems.has(item.id) ? "default" : "outline"}
                           className={`rounded-full gap-2 transition-all duration-300 ${addedItems.has(item.id) ? 'bg-green-600 hover:bg-green-700 border-none' : 'border-brand-bronze/30 text-brand-brown hover:bg-brand-brown hover:text-white'}`}
                         >
                           {addedItems.has(item.id) ? <Check size={18} /> : <ShoppingCart size={18} />}
                           {addedItems.has(item.id) ? t.added_to_cart : t.add_to_cart}
                         </Button>
                       </div>
                    </div>

                    {item.secondPrice && (
                      <div className="space-y-2 pt-4 border-t border-brand-bronze/5">
                        <p className="text-[10px] uppercase tracking-tighter text-brand-black/40 font-bold">{item.secondPriceNote}</p>
                        <div className="flex items-end justify-between gap-4">
                          <div className="font-cormorant text-3xl text-brand-brown font-bold">
                            {item.secondPrice}{t.currency}
                          </div>
                          <Button 
                            onClick={() => handleAddToCart(item.id + '_2')}
                            variant={addedItems.has(item.id + '_2') ? "default" : "outline"}
                            className={`rounded-full gap-2 transition-all duration-300 ${addedItems.has(item.id + '_2') ? 'bg-green-600 hover:bg-green-700 border-none' : 'border-brand-bronze/30 text-brand-brown hover:bg-brand-brown hover:text-white'}`}
                          >
                            {addedItems.has(item.id + '_2') ? <Check size={18} /> : <ShoppingCart size={18} />}
                            {addedItems.has(item.id + '_2') ? t.added_to_cart : t.add_to_cart}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-brand-bronze/5">
        <div className="container max-w-4xl mx-auto px-4 text-center">
           <div className="flex justify-center mb-8 text-brand-bronze/40">
             <Info size={40} />
           </div>
           <p className="font-cormorant text-2xl text-brand-brown italic leading-relaxed">
             {language === 'hu' ? 
               "A különböző Himalájai Hangtálmasszázsok® előtt és után is ~15-15 perces bevezető és lezáró beszélgetés történik." :
               "A 15-minute introductory and closing conversation takes place before and after each Himalayan Singing Bowl Massage®."
             }
           </p>
        </div>
      </section>

      {/* Legal Disclaimer Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
           <h2 className="font-cormorant text-3xl text-brand-brown font-bold mb-6">
             {t.legal_notice}
           </h2>
           <p className="text-brand-black/60 font-montserrat leading-relaxed mb-8">
             {t.copyright}
           </p>
           <div className="flex justify-center">
             <Image src="/images/PalAdri-logo-stroke.svg" alt="Logo" width={80} height={80} className="filter grayscale opacity-30" />
           </div>
        </div>
      </section>
    </div>
  );
}
