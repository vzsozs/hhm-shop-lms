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
import { Facebook, Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(1, "Kérlek, írd be a jelszavadat!"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginTranslations {
  title: string;
  subtitle: string;
  email_label: string;
  email_placeholder: string;
  password_label: string;
  password_placeholder: string;
  forgot_password: string;
  submit: string;
  submitting: string;
  social_login_prefix: string;
  google_login: string;
  facebook_login: string;
  email_divider: string;
  no_account: string;
  register_link: string;
}

export function LoginForm({ t }: { t: LoginTranslations }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      try {
        const result = await loginUser(values);
        if (result?.error) {
          toast.error(result.error);
        } else {
          if (result?.success) toast.success(result.success);
          router.push("/");
          router.refresh();
        }
      } catch (error) {
        console.error("Login hiba:", error);
        toast.error("Váratlan hiba történt a bejelentkezés során.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Social Login */}
      <div className="mb-10">
        <p className="text-brand-brown/60 font-bold font-cormorant text-center mb-6 text-lg">
          {t.social_login_prefix}
        </p>
        <div className="flex flex-col gap-4 mb-10">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="rounded-full border-brand-bronze/20 hover:bg-brand-bronze/5 px-8 font-cormorant font-bold italic h-12 w-full"
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t.google_login}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => signIn("facebook", { callbackUrl: "/" })}
            className="rounded-full border-brand-bronze/20 hover:bg-brand-bronze/5 px-8 font-cormorant font-bold italic h-12 w-full"
          >
            <Facebook className="w-5 h-5 mr-3 text-[#1877F2]" fill="currentColor" />
            {t.facebook_login}
          </Button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-brand-bronze/20 flex-1"></div>
          <p className="text-xs text-brand-black/40 font-montserrat uppercase tracking-widest font-bold">
            {t.email_divider}
          </p>
          <div className="h-px bg-brand-bronze/20 flex-1"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.email_label}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
            <Input 
              {...register("email")}
              type="email" 
              placeholder={t.email_placeholder} 
              className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11"
            />
          </div>
          {errors.email?.message && <p className="text-xs text-red-500 ml-1">{errors.email.message.toString()}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <Label className="text-brand-brown/80 font-bold font-cormorant text-lg">{t.password_label}</Label>
            <Link href="#" className="text-xs text-brand-bronze hover:text-brand-brown transition-colors font-montserrat font-bold underline underline-offset-4">
              {t.forgot_password}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
            <Input 
              {...register("password")}
              type={showPassword ? "text" : "password"} 
              placeholder={t.password_placeholder} 
              className="pl-10 pr-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-bronze/40 hover:text-brand-bronze transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password?.message && <p className="text-xs text-red-500 ml-1">{errors.password.message.toString()}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white font-montserrat font-bold py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 mt-4"
        >
          {isPending ? t.submitting : t.submit}
        </Button>
      </form>

      <div className="mt-12 text-center">
        <p className="text-brand-black/60 font-montserrat text-sm">
          {t.no_account}{" "}
          <Link href="/register-new" className="text-brand-brown font-bold hover:underline underline-offset-4">
            {t.register_link}
          </Link>
        </p>
      </div>
    </div>
  );
}
