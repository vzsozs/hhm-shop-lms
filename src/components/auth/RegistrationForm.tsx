"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Eye, EyeOff, Facebook, Mail, Lock, User, Phone, Briefcase, MapPin, Building2, Hash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUserNew } from "@/modules/auth/actions";
import { registerUserNewSchema } from "@/modules/auth/schemas";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import * as z from "zod";

type FormValues = z.infer<typeof registerUserNewSchema>;

export interface RegistrationTranslations {
  step1_title: string;
  step2_title: string;
  step3_title: string;
  social_login_prefix: string;
  google_login: string;
  facebook_login: string;
  email_divider: string;
  email_label: string;
  email_placeholder: string;
  password_label: string;
  password_placeholder: string;
  confirm_label: string;
  accept_terms_prefix: string;
  terms_link: string;
  read_privacy_prefix: string;
  privacy_link: string;
  lastname_label: string;
  lastname_placeholder: string;
  firstname_label: string;
  firstname_placeholder: string;
  phone_label: string;
  phone_placeholder: string;
  country_label: string;
  country_placeholder: string;
  zip_label: string;
  zip_placeholder: string;
  city_label: string;
  city_placeholder: string;
  street_label: string;
  street_placeholder: string;
  company_label: string;
  company_placeholder: string;
  tax_label: string;
  tax_placeholder: string;
  expertise_label: string;
  expertise_placeholder: string;
  interests_label: string;
  interests_placeholder: string;
  lms_info: string;
  back: string;
  next: string;
  submit: string;
  submitting: string;
  have_account: string;
  login_link: string;
}

export function RegistrationForm({ t }: { t: RegistrationTranslations }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerUserNewSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      termsAccepted: false,
      privacyAccepted: false,
      firstName: "",
      lastName: "",
      phone: "",
      country: "",
      zip: "",
      city: "",
      street: "",
      companyName: "",
      taxNumber: "",
      expertise: "egyeb",
      interests: "hangtalak",
    },
    mode: "onChange",
  });

  const { register, handleSubmit, formState: { errors }, watch, trigger, setValue } = form;

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await registerUserNew(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || "Sikeres regisztráció!");
        router.push("/login");
      }
    });
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const isStep1Valid = await trigger(["email", "password", "passwordConfirm", "termsAccepted", "privacyAccepted"]);
      if (!isStep1Valid) return;
    }
    if (currentStep < 3) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const isStep1ValidOnly = watch("email") && watch("password") && watch("passwordConfirm") && watch("termsAccepted") && watch("privacyAccepted") && !errors.email && !errors.password && !errors.passwordConfirm;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Visual Stepper */}
      <div className="flex justify-between items-center mb-16 relative max-w-2xl mx-auto px-0">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-brand-bronze/10 -translate-y-1/2 z-0"></div>
        {/* Progress Bar Active */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-brand-brown -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        ></div>

        {[1, 2, 3].map((step) => (
          <div key={step} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => step < currentStep && setCurrentStep(step)}>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center font-normal font-montserrat transition-all duration-300 border-2 shadow-sm",
              currentStep === step ? "bg-brand-brown text-white border-brand-brown scale-110 shadow-md" : 
              currentStep > step ? "bg-brand-brown text-white border-brand-brown" : 
              "bg-white text-brand-black/20 border-brand-bronze/20"
            )}>
              {currentStep > step ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xxl">{step}</span>}
            </div>
            <span className={cn(
              "text-xs md:text-sm font-bold font-montserrat absolute -bottom-10 whitespace-nowrap transition-colors duration-300 text-center tracking-wide",
              currentStep === step ? "text-brand-brown" : "text-brand-black/40"
            )}>
              {step === 1 ? t.step1_title : step === 2 ? t.step2_title : t.step3_title}
            </span>
          </div>
        ))}
      </div>

      <div className="h-8"></div> {/* Spacer for stepper labels */}

      {/* Social Login */}
      {currentStep === 1 && (
        <div className="mb-12">
          <p className="text-brand-brown/60 font-bold font-cormorant text-center mb-6 text-lg">{t.social_login_prefix}</p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-10">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="rounded-full border-brand-bronze/20 hover:bg-brand-bronze/5 px-8 font-cormorant font-bold italic h-12 flex-1 md:max-w-xs"
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
              className="rounded-full border-brand-bronze/20 hover:bg-brand-bronze/5 px-8 font-cormorant font-bold italic h-12 flex-1 md:max-w-xs"
            >
              <Facebook className="w-5 h-5 mr-3 text-[#1877F2]" fill="currentColor" />
              {t.facebook_login}
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-brand-bronze/20 flex-1"></div>
            <p className="text-xs text-brand-black/40 font-montserrat uppercase tracking-widest font-bold">{t.email_divider}</p>
            <div className="h-px bg-brand-bronze/20 flex-1"></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <>
            <div className="space-y-2 md:col-span-2">
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
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.password_label}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"} 
                  placeholder={t.password_placeholder} 
                  className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-bronze/40 hover:text-brand-brown"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password?.message && <p className="text-xs text-red-500 ml-1">{errors.password.message.toString()}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.confirm_label}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input 
                  {...register("passwordConfirm")}
                  type={showPasswordConfirm ? "text" : "password"} 
                  placeholder={t.password_placeholder} 
                  className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-bronze/40 hover:text-brand-brown"
                >
                  {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.passwordConfirm?.message && <p className="text-xs text-red-500 ml-1">{errors.passwordConfirm.message.toString()}</p>}
            </div>

            <div className="md:col-span-2 space-y-4 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="terms" 
                  checked={watch("termsAccepted")}
                  onCheckedChange={(checked) => setValue("termsAccepted", !!checked, { shouldValidate: true })}
                  className="mt-1 border-brand-bronze/30 data-[state=checked]:bg-brand-brown data-[state=checked]:border-brand-brown"
                />
                <Label htmlFor="terms" className="text-xs leading-relaxed text-brand-black/60 font-montserrat font-normal">
                  {t.accept_terms_prefix} <a href="#" className="text-brand-brown hover:underline font-bold">{t.terms_link}</a>.
                </Label>
              </div>
              {errors.termsAccepted?.message && <p className="text-xs text-red-500 ml-1">{errors.termsAccepted.message.toString()}</p>}

              <div className="flex items-start gap-2">
                <Checkbox 
                  id="privacy" 
                  checked={watch("privacyAccepted")}
                  onCheckedChange={(checked) => setValue("privacyAccepted", !!checked, { shouldValidate: true })}
                  className="mt-1 border-brand-bronze/30 data-[state=checked]:bg-brand-brown data-[state=checked]:border-brand-brown"
                />
                <Label htmlFor="privacy" className="text-xs leading-relaxed text-brand-black/60 font-montserrat font-normal">
                  {t.read_privacy_prefix} <a href="#" className="text-brand-brown hover:underline font-bold">{t.privacy_link}</a>.
                </Label>
              </div>
              {errors.privacyAccepted?.message && <p className="text-xs text-red-500 ml-1">{errors.privacyAccepted.message.toString()}</p>}
            </div>
          </>
        )}

        {/* Step 2: Personal Info */}
        {currentStep === 2 && (
          <>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.lastname_label}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("lastName")} placeholder={t.lastname_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.firstname_label}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("firstName")} placeholder={t.firstname_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.phone_label}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("phone")} placeholder={t.phone_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.country_label}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("country")} placeholder={t.country_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.zip_label}</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("zip")} placeholder={t.zip_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.city_label}</Label>
              <Input {...register("city")} placeholder={t.city_placeholder} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.street_label}</Label>
              <Input {...register("street")} placeholder={t.street_placeholder} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.company_label}</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
                <Input {...register("companyName")} placeholder={t.company_placeholder} className="pl-10 bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.tax_label}</Label>
              <Input {...register("taxNumber")} placeholder={t.tax_placeholder} className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11" />
            </div>
          </>
        )}

        {/* Step 3: Student Profile */}
        {currentStep === 3 && (
          <>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.expertise_label}</Label>
              <Select onValueChange={(val) => setValue("expertise", val)}>
                <SelectTrigger className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11">
                  <SelectValue placeholder={t.expertise_placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zene">Zene / Hangterápia</SelectItem>
                  <SelectItem value="egeszsegugy">Egészségügy</SelectItem>
                  <SelectItem value="oktatas">Oktatás</SelectItem>
                  <SelectItem value="wellness">Wellness / Jóga</SelectItem>
                  <SelectItem value="egyeb">Egyéb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-brand-brown/80 ml-1 font-bold font-cormorant text-lg">{t.interests_label}</Label>
              <Select onValueChange={(val) => setValue("interests", val)}>
                <SelectTrigger className="bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11">
                  <SelectValue placeholder={t.interests_placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hangtalak">Hangtálak</SelectItem>
                  <SelectItem value="gong">Gongok</SelectItem>
                  <SelectItem value="kurzusok">Tanulmányok / Kurzusok</SelectItem>
                  <SelectItem value="eszkozok">Terápiás eszközök</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 bg-brand-bronze/10 p-6 rounded-2xl flex gap-4 text-sm text-brand-black/70 italic font-cormorant border border-brand-bronze/5">
              <Briefcase className="w-6 h-6 text-brand-bronze shrink-0" />
              <p className="text-lg">{t.lms_info}</p>
            </div>
          </>
        )}

        {/* Buttons Section */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mt-8">
          <div className="flex-1 flex gap-4">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="flex-1 h-14 border-brand-bronze/20 text-brand-brown hover:bg-white/40 rounded-full font-cormorant font-bold uppercase tracking-widest transition-all"
              >
                {t.back}
              </Button>
            )}
            
            {currentStep < 3 && (
              <Button 
                type="button" 
                onClick={nextStep}
                disabled={currentStep === 1 && !isStep1ValidOnly}
                className="flex-1 h-14 bg-brand-bronze/20 hover:bg-brand-bronze/30 text-brand-brown font-bold rounded-full transition-all font-cormorant tracking-widest uppercase disabled:opacity-30"
              >
                {t.next}
              </Button>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isPending || !isStep1ValidOnly}
            className="flex-1 h-14 bg-brand-brown hover:bg-brand-black text-white px-12 text-lg rounded-full transition-all shadow-lg hover:shadow-xl font-cormorant tracking-widest uppercase disabled:opacity-30"
          >
            {isPending ? t.submitting : t.submit}
          </Button>
        </div>

        {/* Login redirect */}
        {currentStep === 1 && (
          <div className="md:col-span-2 text-center mt-6">
            <p className="text-brand-black/60 font-montserrat">
              {t.have_account}{" "}
              <Link href="/login" className="text-brand-brown font-bold hover:underline underline-offset-4">
                {t.login_link}
              </Link>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
