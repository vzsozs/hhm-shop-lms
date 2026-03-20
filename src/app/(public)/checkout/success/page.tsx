"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/context/cart-store';
import { useLanguage } from '@/context/language-context';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

function SuccessContent() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('payment_intent_client_secret');
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const clearCart = useCartStore((state) => state.clearCart);
  const { language } = useLanguage();

  useEffect(() => {
    if (!clientSecret) {
      setStatus('error');
      setMessage(language === 'hu' ? 'Nem található fizetési azonosító rápillantva az URL-re.' : 'No payment intent id found from URL.');
      return;
    }

    stripePromise.then((stripe) => {
      if (!stripe) return;
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded':
            setStatus('success');
            setMessage(language === 'hu' ? 'A fizetés sikeres volt!' : 'Payment succeeded!');
            // Kosár kiürítése
            clearCart();
            break;
          case 'processing':
            setStatus('processing');
            setMessage(language === 'hu' ? 'A fizetés feldolgozás alatt áll.' : 'Payment is processing.');
            clearCart();
            break;
          case 'requires_payment_method':
            setStatus('error');
            setMessage(language === 'hu' ? 'A fizetés nem sikerült, kérlek próbáld újra.' : 'Payment failed, please try again.');
            break;
          default:
            setStatus('error');
            setMessage(language === 'hu' ? 'Valami hiba történt.' : 'Something went wrong.');
            break;
        }
      });
    });
  }, [clientSecret, clearCart, language]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 text-brand-bronze animate-spin mb-4" />
        <h2 className="text-2xl font-bold font-cormorant text-brand-brown">Rendelés ellenőrzése...</h2>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <XCircle className="h-20 w-20 text-destructive mb-6" />
        <h1 className="text-4xl font-bold font-cormorant text-brand-brown mb-4">Sikertelen Fizetés</h1>
        <p className="text-brand-black/70 mb-8">{message}</p>
        <Link href="/checkout">
          <Button className="bg-brand-brown hover:bg-brand-black text-white px-8 h-12 text-lg">Újrapróbálom</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CheckCircle2 className="h-24 w-24 text-green-500 mb-6 drop-shadow-md" />
      <h1 className="text-4xl md:text-5xl font-bold font-cormorant text-brand-brown mb-4">Sikeres Rendelés!</h1>
      <p className="text-lg text-brand-black/70 mb-8 max-w-lg">
        {message} A rendszer elküldte a visszaigazolást, és hamarosan felvesszük Veled a kapcsolatot a további lépésekkel kapcsolatban.
      </p>
      <Link href="/">
        <Button className="bg-brand-bronze hover:bg-[#726251] text-white px-10 h-12 text-lg rounded-full font-bold">
          Vissza a főoldalra
        </Button>
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 mt-20 min-h-[60vh] flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-brand-bronze/20 w-full p-8 md:p-12">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-brand-bronze animate-spin mb-4" />
          </div>
        }>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
