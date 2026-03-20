"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useCartStore } from "@/context/cart-store";
import { useLanguage } from "@/context/language-context";
import { CheckoutForm } from "@/components/shop/checkout-form";
import { useRouter } from "next/navigation";

// A NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY felolvasása
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { items } = useCartStore();
  const { language } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/shop');
      return;
    }

    // Elküldjük a kosarat a backendnek, hogy készítsen belőle egy PaymentIntent-et
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, language }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }
        return res.json();
      })
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        console.error("Hiba a fizetés előkészítésekor:", err);
        setErrorMessage(err.message);
      });
  }, [items, language, router]);

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#8a7964', // brand-bronze
      colorBackground: '#ffffff',
      colorText: '#4c4238', // brand-brown
      borderRadius: '8px',
    },
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4 mt-20 min-h-[60vh]">
      <h1 className="text-3xl font-bold font-cormorant text-brand-brown mb-8 text-center">
        {language === 'hu' ? 'Biztonságos Fizetés' : (language === 'en' ? 'Secure Checkout' : 'Bezpečná platba')}
      </h1>
      
      {errorMessage ? (
        <div className="flex flex-col items-center justify-center space-y-4 my-20">
          <div className="text-destructive font-bold text-xl text-center bg-red-50 p-6 rounded-lg max-w-lg border border-red-200">
            {errorMessage}
          </div>
          <button onClick={() => router.push('/shop')} className="text-brand-brown underline font-bold mt-4">Vissza a bolthoz</button>
        </div>
      ) : clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 my-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-bronze"></div>
          <p className="text-brand-brown font-medium italic">
            {language === "hu" ? "Beszéljük meg a részleteket a bankkal..." : "Communicating with bank..."}
          </p>
        </div>
      )}
    </div>
  );
}
