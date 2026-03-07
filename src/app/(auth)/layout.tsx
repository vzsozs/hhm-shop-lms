import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white font-mono tracking-tighter">
            HHM<span className="text-brand-orange">Shop</span> & LMS
          </h1>
          <p className="text-white/50 mt-2">Jelentkezz be vagy regisztrálj a folytatáshoz</p>
        </div>
        
        <div className="bg-card-bg border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Háttér díszítés */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
