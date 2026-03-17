import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen email cím" }),
  fullName: z.string().min(2, { message: "Név megadása kötelező" }),
  maidenName: z.string().optional(),
  motherName: z.string().min(2, { message: "Anyja neve kötelező" }),
  birthPlaceDate: z.string().min(2, { message: "Születési hely és idő kötelező" }),
  phone: z.string().min(6, { message: "Telefonszám kötelező" }),
  billingAddress: z.string().min(5, { message: "Számlázási cím kötelező" }),
  education: z.string().min(1, { message: "Végzettség kiválasztása kötelező" }),
  billingType: z.enum(["private", "company"]),
  companyName: z.string().optional(),
  taxNumber: z.string().optional(),
  experience: z.string().min(10, { message: "Kérjük részletezd a tapasztalataidat" }),
  hasInstruments: z.enum(["yes", "no"]),
  instrumentsDetail: z.string().optional(),
  motivation: z.string().min(10, { message: "Kérjük írd le a motivációdat" }),
  healthIssues: z.enum(["yes", "no", "irrelevant"]),
  comment: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RegistrationFormProps {
  trainingTitle: string;
  trainingDate: string;
  lang: string;
  onSuccess?: () => void;
}

const translations: Record<string, {
  title: string;
  for: string;
  email: string;
  fullName: string;
  maidenName: string;
  motherName: string;
  birthPlaceDate: string;
  phone: string;
  billingAddress: string;
  education: string;
  educationOptions: { value: string; label: string }[];
  billingInfo: string;
  private: string;
  company: string;
  companyName: string;
  taxNumber: string;
  experience: string;
  hasInstruments: string;
  instrumentsDetail: string;
  motivation: string;
  healthIssues: string;
  healthDescription: string;
  yes: string;
  no: string;
  irrelevant: string;
  comment: string;
  submit: string;
}> = {
  hu: {
    title: "Jelentkezés",
    for: "képzésre",
    email: "Email*",
    fullName: "Név (Amit szeretne a tanúsítványon használni.)*",
    maidenName: "Leánykori név",
    motherName: "Anyja neve*",
    birthPlaceDate: "Születési hely, idő*",
    phone: "Telefonszám*",
    billingAddress: "Számlázási cím*",
    education: "Legmagasabb iskolai végzettség*",
    educationOptions: [
      { value: "none", label: "Végzettség nélkül" },
      { value: "elementary", label: "Általános iskolai végzettség" },
      { value: "high_school", label: "Középfokú végzettség és gimnáziumi érettségi (gimnázium)" },
      { value: "vocational", label: "Középfokú végzettség és középfokú szakképesítés (szakgimnázium, szakképző iskola, szakiskola)" },
      { value: "technical", label: "Középfokú végzettség és középfokú szakképzettség (technikum)" },
      { value: "university", label: "Felsőfokú végzettségi szint és felsőfokú szakképzettség (felsőoktatási intézmény)" },
      { value: "higher_vocational", label: "Felsőoktatási szakképzés (felsőoktatási intézmény)" },
    ],
    billingInfo: "Számlainformációk",
    private: "Magánszemély",
    company: "Cég",
    companyName: "Cégnév",
    taxNumber: "Adószám",
    experience: "Hangterápiával, hangtálmasszázzsal kapcsolatos tapasztalatok, egyéb képzettségek*",
    hasInstruments: "Rendelkezik-e hangterápiás eszközökkel?*",
    instrumentsDetail: "Mivel?",
    motivation: "Jelentkezés célja (motiváció, jövőbeli alkalmazás)*",
    healthIssues: "Van-e jelenleg vagy volt-e az elmúlt években olyan testi vagy lelki nehézsége, amely befolyásolhatja a hangeszközök hatását?*",
    healthDescription: "(Különös tekintett epilepszia, pszichoszomatikus tünetekre, szorongásra, pszichiátriai állapotokra, életvezetési elakadásokra.)",
    yes: "Igen",
    no: "Nem",
    irrelevant: "Képzés szempontjából érdektelen",
    comment: "Megjegyzés",
    submit: "Jelentkezési díj kifizetése: 50.000.-",
  },
  en: {
    title: "Registration",
    for: "for training",
    email: "Email*",
    fullName: "Name (To be used on the certificate)*",
    maidenName: "Maiden name",
    motherName: "Mother's name*",
    birthPlaceDate: "Place and date of birth*",
    phone: "Phone number*",
    billingAddress: "Billing address*",
    education: "Highest level of education*",
    educationOptions: [
      { value: "none", label: "None" },
      { value: "elementary", label: "Elementary school" },
      { value: "high_school", label: "High school" },
      { value: "vocational", label: "Vocational school" },
      { value: "technical", label: "Technical school" },
      { value: "university", label: "University/Higher education" },
      { value: "higher_vocational", label: "Higher vocational training" },
    ],
    billingInfo: "Billing information",
    private: "Private individual",
    company: "Company",
    companyName: "Company name",
    taxNumber: "Tax number",
    experience: "Experience with sound therapy/singing bowl massage, other qualifications*",
    hasInstruments: "Do you have sound therapy instruments?*",
    instrumentsDetail: "What kind?",
    motivation: "Purpose of application (motivation, future application)*",
    healthIssues: "Do you have or have you had in recent years any physical or mental difficulties that may affect the effect of sound instruments?*",
    healthDescription: "(Especially epilepsy, psychosomatic symptoms, anxiety, psychiatric conditions, life-management blocks.)",
    yes: "Yes",
    no: "No",
    irrelevant: "Irrelevant for the training",
    comment: "Comment",
    submit: "Pay registration fee: 50,000 HUF",
  },
  sk: {
    title: "Registrácia",
    for: "na školenie",
    email: "Email*",
    fullName: "Meno (Ktoré chcete použiť na certifikáte)*",
    maidenName: "Rodné priezvisko",
    motherName: "Meno matky*",
    birthPlaceDate: "Miesto a dátum narodenia*",
    phone: "Telefónne číslo*",
    billingAddress: "Fakturačná adresa*",
    education: "Najvyššie dosiahnuté vzdelanie*",
    educationOptions: [
      { value: "none", label: "Bez vzdelania" },
      { value: "elementary", label: "Základné vzdelanie" },
      { value: "high_school", label: "Stredoškolské vzdelanie s maturitou" },
      { value: "vocational", label: "Odborné vzdelanie" },
      { value: "technical", label: "Technické vzdelanie" },
      { value: "university", label: "Vysokoškolské vzdelanie" },
      { value: "higher_vocational", label: "Vyššie odborné vzdelanie" },
    ],
    billingInfo: "Fakturačné údaje",
    private: "Súkromná osoba",
    company: "Firma",
    companyName: "Názov firmy",
    taxNumber: "DIČ/IČO",
    experience: "Skúsenosti so zvukovou terapiou, masážou s misami, iné kvalifikácie*",
    hasInstruments: "Máte nástroje na zvukovú terapiu?*",
    instrumentsDetail: "Aké?",
    motivation: "Účel prihlásenia (motivácia, budúce uplatnenie)*",
    healthIssues: "Máte alebo ste mali v posledných rokoch nejaké telesné alebo duševné ťažkosti, ktoré by mohli ovplyvniť účinok zvukových nástrojov?*",
    healthDescription: "(Najmä epilepsia, psychosomatické príznaky, úzkosť, psychiatrické stavy, životné bloky.)",
    yes: "Áno",
    no: "Nie",
    irrelevant: "Nerelevantné pre školenie",
    comment: "Poznámka",
    submit: "Zaplatiť registračný poplatok: 50 000 HUF",
  }
};

export function RegistrationForm({ trainingTitle, trainingDate, lang, onSuccess }: RegistrationFormProps) {
  const { data: session } = useSession();
  const t = translations[lang] || translations.hu;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: session?.user?.email || "",
      fullName: session?.user?.name || "",
      maidenName: "",
      motherName: "",
      birthPlaceDate: "",
      phone: "",
      billingAddress: "",
      education: "",
      billingType: "private",
      companyName: "",
      taxNumber: "",
      experience: "",
      hasInstruments: "no",
      instrumentsDetail: "",
      motivation: "",
      healthIssues: "no",
      comment: "",
    },
  });

  const billingType = form.watch("billingType");
  const hasInstruments = form.watch("hasInstruments");

  function onSubmit(values: FormValues) {
    console.log(values);
    // Végén a gomb nincs bekötve sehova a kérés szerint
    if (onSuccess) onSuccess();
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <div className="mb-6">
        <h2 className="text-xl font-bold font-cormorant text-brand-brown">
          {t.title} {trainingTitle} {t.for}
        </h2>
        <p className="text-sm text-brand-black/60 italic">({trainingDate})</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.email}</FormLabel>
                  <FormControl>
                    <Input placeholder="example@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.fullName}</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maidenName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.maidenName}</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.motherName}</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthPlaceDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.birthPlaceDate}</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.phone}</FormLabel>
                  <FormControl>
                    <Input placeholder="+36..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="billingAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.billingAddress}</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="education"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.education}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {t.educationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="font-bold text-sm text-brand-brown">{t.billingInfo}</h3>
            <FormField
              control={form.control}
              name="billingType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="r1" />
                        <Label htmlFor="r1">{t.private}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="company" id="r2" />
                        <Label htmlFor="r2">{t.company}</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {billingType === "company" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.companyName}</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.taxNumber}</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="h-px bg-brand-bronze/10 w-full" />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.experience}</FormLabel>
                <FormControl>
                  <Textarea placeholder="" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="hasInstruments"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t.hasInstruments}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="i1" />
                        <Label htmlFor="i1">{t.yes}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="i2" />
                        <Label htmlFor="i2">{t.no}</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {hasInstruments === "yes" && (
              <FormField
                control={form.control}
                name="instrumentsDetail"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FormLabel>{t.instrumentsDetail}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name="motivation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.motivation}</FormLabel>
                <FormControl>
                  <Textarea placeholder="" className="min-h-[100px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="healthIssues"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t.healthIssues}</FormLabel>
                <FormDescription>{t.healthDescription}</FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="h1" />
                      <Label htmlFor="h1">{t.yes}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="h2" />
                      <Label htmlFor="h2">{t.no}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="irrelevant" id="h3" />
                      <Label htmlFor="h3">{t.irrelevant}</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="comment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.comment}</FormLabel>
                <FormControl>
                  <Textarea placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-brand-brown hover:bg-brand-brown/90 text-white font-bold py-6 text-lg">
            {t.submit}
          </Button>
        </form>
      </Form>
    </div>
  );
}
