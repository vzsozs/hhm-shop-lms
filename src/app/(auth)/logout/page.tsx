"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  useEffect(() => {
    // Automatikusan kiléptetjük és a főoldalra vagy a loginra irányítjuk
    signOut({ callbackUrl: "/login", redirect: true });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-12">
      <Loader2 className="w-12 h-12 text-brand-orange animate-spin" />
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Kijelentkezés...</h2>
        <p className="text-white/50 text-sm">Biztonságos kilépés a fiókból, kérlek várj.</p>
      </div>
    </div>
  );
}
