import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 max-w-5xl mx-auto">
      <h1 className="font-cormorant text-5xl md:text-7xl mb-8 text-brand-brown tracking-wide text-center">
        Üdvözöljük a Hangakadémián!
      </h1>
      <p className="max-w-2xl text-center mb-12 text-brand-black text-lg font-montserrat opacity-80">
        Fedezd fel hangtál masszázsainkat, a Hangakadémia oktatásait, valamint válogass prémium termékeink közül webshopunkban.
      </p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <Link 
          href="/shop"
          className="px-8 py-3 rounded-[20em] text-brand-black font-semibold text-sm tracking-[2px] uppercase transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(90deg, #8a7964, #d8c5b1 43%, #d6c3af 54%, #897863)' }}
        >
          Tovább a Shopba
        </Link>
      </div>
    </div>
  );
}
