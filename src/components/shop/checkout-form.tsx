"use client";

import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

export function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { language } = useLanguage();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Ismeretlen hiba történt.");
      } else {
        setMessage(language === 'hu' ? "Váratlan hiba lépett fel a fizetés során." : "An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6 bg-white/70 p-6 md:p-8 rounded-xl shadow-lg border border-brand-bronze/20 backdrop-blur-sm">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      <Button 
        disabled={isLoading || !stripe || !elements} 
        id="submit" 
        className="w-full h-12 text-lg font-bold bg-brand-bronze hover:bg-[#726251] text-white rounded-md mt-6 shadow-md transition-all hover:shadow-lg"
      >
        <span id="button-text">
          {isLoading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              {language === 'hu' ? "Feldolgozás..." : "Processing..."}
            </div>
          ) : (
            language === 'hu' ? "Fizetés" : "Pay now"
          )}
        </span>
      </Button>
      
      {message && <div id="payment-message" className="text-destructive font-bold text-center mt-4">{message}</div>}
    </form>
  );
}
