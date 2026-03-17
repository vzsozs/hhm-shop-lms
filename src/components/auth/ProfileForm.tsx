"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Phone, MapPin, Building2, Hash, Briefcase, Languages, Home, CreditCard, Truck, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateSelf } from "@/modules/auth/actions";
import { userProfileUpdateSchema } from "@/modules/auth/schemas";
import * as z from "zod";

type ProfileFormValues = z.infer<typeof userProfileUpdateSchema>;

export interface ProfileFormTranslations {
  personal_section: string;
  professional_section: string;
  billing_section: string;
  shipping_section: string;
  
  firstname_label: string;
  lastname_label: string;
  phone_label: string;
  lang_label: string;
  
  expertise_label: string;
  interests_label: string;
  
  country_label: string;
  zip_label: string;
  city_label: string;
  street_label: string;
  company_label: string;
  tax_label: string;
  
  logout: string;
  submit: string;
  submitting: string;
  success: string;
}

interface ProfileFormProps {
  initialData: Partial<ProfileFormValues>;
  t: ProfileFormTranslations;
}

export function ProfileForm({ initialData, t }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(userProfileUpdateSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: {
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      phone: initialData.phone || "",
      lang: initialData.lang || "hu",
      expertise: initialData.expertise || "",
      interests: initialData.interests || "",
      billing_country: initialData.billing_country || "HU",
      billing_zip: initialData.billing_zip || "",
      billing_city: initialData.billing_city || "",
      billing_street: initialData.billing_street || "",
      billing_companyName: initialData.billing_companyName || "",
      billing_taxNumber: initialData.billing_taxNumber || "",
      shipping_country: initialData.shipping_country || "HU",
      shipping_zip: initialData.shipping_zip || "",
      shipping_city: initialData.shipping_city || "",
      shipping_street: initialData.shipping_street || "",
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateSelf(values);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t.success);
      }
    });
  };

  const sectionHeaderClass = "flex items-center gap-3 font-cormorant text-2xl text-brand-brown font-bold mb-6 italic border-b border-brand-bronze/10 pb-2";
  const labelClass = "text-brand-brown/80 ml-1 font-bold font-cormorant text-lg";
  const inputClass = "bg-white/60 border-brand-bronze/20 focus-visible:ring-brand-bronze/30 h-11 pl-10";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      {/* PERSONAL SECTION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <User className="w-6 h-6" />
          {t.personal_section}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={labelClass}>{t.lastname_label}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("lastName")} className={inputClass} />
            </div>
            {form.formState.errors.lastName && <p className="text-xs text-red-500">{form.formState.errors.lastName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.firstname_label}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("firstName")} className={inputClass} />
            </div>
            {form.formState.errors.firstName && <p className="text-xs text-red-500">{form.formState.errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.phone_label}</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("phone")} className={inputClass} />
            </div>
            {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.lang_label}</Label>
            <div className="relative">
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40 z-10" />
              <Select value={form.watch("lang")} onValueChange={(val) => form.setValue("lang", val)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hu">Magyar</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="sk">Slovenčina</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL SECTION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Briefcase className="w-6 h-6" />
          {t.professional_section}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={labelClass}>{t.expertise_label}</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40 z-10" />
              <Select value={form.watch("expertise") || ""} onValueChange={(val) => form.setValue("expertise", val)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
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
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.interests_label}</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40 z-10" />
              <Select value={form.watch("interests") || ""} onValueChange={(val) => form.setValue("interests", val)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hangtalak">Hangtálak</SelectItem>
                  <SelectItem value="gong">Gongok</SelectItem>
                  <SelectItem value="kurzusok">Tanulmányok / Kurzusok</SelectItem>
                  <SelectItem value="eszkozok">Terápiás eszközök</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* BILLING SECTION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <CreditCard className="w-6 h-6" />
          {t.billing_section}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={labelClass}>{t.country_label}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_country")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.zip_label}</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_zip")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.city_label}</Label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_city")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.street_label}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_street")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.company_label}</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_companyName")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.tax_label}</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("billing_taxNumber")} className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      {/* SHIPPING SECTION */}
      <section>
        <h3 className={sectionHeaderClass}>
          <Truck className="w-6 h-6" />
          {t.shipping_section}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className={labelClass}>{t.country_label}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("shipping_country")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.zip_label}</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("shipping_zip")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.city_label}</Label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("shipping_city")} className={inputClass} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={labelClass}>{t.street_label}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-bronze/40" />
              <Input {...form.register("shipping_street")} className={inputClass} />
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8 flex flex-col md:flex-row gap-4">
        <Button 
          type="button"
          variant="outline"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex-1 h-14 border-brand-bronze/20 text-brand-brown hover:bg-white/40 rounded-full font-cormorant font-bold uppercase tracking-widest transition-all gap-2"
        >
          <LogOut className="w-5 h-5" />
          {t.logout}
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="flex-[2] h-14 bg-brand-brown hover:bg-brand-black text-white text-lg rounded-full transition-all shadow-lg hover:shadow-xl font-cormorant tracking-widest uppercase disabled:opacity-30"
        >
          {isPending ? t.submitting : t.submit}
        </Button>
      </div>
    </form>
  );
}
