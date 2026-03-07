"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginUser } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(1, "Kérlek, írd be a jelszavadat!"),
  name: z.string().optional(), // Csak azért, hogy a loginUser action type kompatibilis legyen a register sémával
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      try {
        const result = await loginUser(values);
        
        // Ha van error üznet az AuthError miatt:
        if (result?.error) {
          toast.error(result.error);
        } else if (result?.success) {
          // Ha valamiért lefutna a redirect nélküli success ág
          toast.success(result.success);
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        console.error("Login hiba:", error)
      }
    });
  };

  const handleGoogleLogin = () => {
    setGooglePending(true);
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Bejelentkezés</h2>
        <p className="text-sm text-white/50">Lépj be a fiókodba a folytatáshoz.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/70">E-mail cím</Label>
          <Input 
            {...register("email")}
            type="email" 
            placeholder="pelda@email.com" 
            className="bg-white/5 border-white/10 text-white focus-visible:ring-brand-orange"
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-white/70">Jelszó</Label>
            <Link href="#" className="text-xs text-brand-orange hover:text-brand-orange/80 transition-colors">
              Elfelejtetted?
            </Link>
          </div>
          <Input 
            {...register("password")}
            type="password" 
            placeholder="••••••••" 
            className="bg-white/5 border-white/10 text-white focus-visible:ring-brand-orange"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isPending || googlePending}
          className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium h-11"
        >
          {isPending ? "Bejelentkezés folyamatban..." : "Bejelentkezés"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card-bg text-white/40">Vagy folytasd ezzel</span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={handleGoogleLogin}
        disabled={isPending || googlePending}
        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white h-11"
      >
        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Bejelentkezés Google-fiókkal
      </Button>

      <p className="text-center text-sm text-white/50">
        Még nincs fiókod?{" "}
        <Link href="/register" className="text-brand-orange hover:text-brand-orange/80 transition-colors font-medium">
          Regisztrálj most!
        </Link>
      </p>
    </div>
  );
}
