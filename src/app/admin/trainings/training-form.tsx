"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Calendar as CalendarIcon, 
  Save, 
  ArrowLeft,
  Loader2,
  Globe,
  MapPin,
  Clock,
  Briefcase,
  CalendarDays
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createTraining, updateTraining } from "@/app/actions/trainings";

const trainingFormSchema = z.object({
  level: z.string().min(1, "Válasz ki egy szintet"),
  type: z.string().min(1, "Válasz ki egy típust"),
  priceHuf: z.number().min(0, "Az ár nem lehet negatív"),
  datesHu: z.string().min(1, "Magyar nyelvű időpont megadása kötelező"),
  datesEn: z.string().default(""),
  datesSk: z.string().default(""),
  locationHu: z.string().min(1, "Magyar nyelvű helyszín megadása kötelező"),
  locationEn: z.string().default(""),
  locationSk: z.string().default(""),
  isActive: z.boolean().default(true),
});

type TrainingFormValues = z.infer<typeof trainingFormSchema>;

interface TrainingFormProps {
  initialData?: any;
}

export function TrainingForm({ initialData }: TrainingFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingFormSchema) as any,
    defaultValues: initialData ? {
      level: initialData.level,
      type: initialData.type,
      priceHuf: Number(initialData.priceHuf) || 0,
      datesHu: initialData.datesHu,
      datesEn: initialData.datesEn || "",
      datesSk: initialData.datesSk || "",
      locationHu: initialData.locationHu,
      locationEn: initialData.locationEn || "",
      locationSk: initialData.locationSk || "",
      isActive: initialData.isActive ?? true,
    } : {
      level: "",
      type: "",
      priceHuf: 0,
      datesHu: "",
      datesEn: "",
      datesSk: "",
      locationHu: "1188 Budapest, Nemes u. 88.",
      locationEn: "",
      locationSk: "",
      isActive: true,
    },
  });

  const formatDateRange = (from: Date | undefined, to: Date | undefined) => {
    if (!from) return "";
    if (!to) return format(from, "yyyy. MMMM d.", { locale: hu });
    
    if (from.getFullYear() === to.getFullYear()) {
      if (from.getMonth() === to.getMonth()) {
        const start = format(from, "yyyy. MMMM d", { locale: hu });
        const end = format(to, "d.", { locale: hu });
        return `${start}-${end}`;
      }
      const start = format(from, "yyyy. MMMM d.", { locale: hu });
      const end = format(to, "MMMM d.", { locale: hu });
      return `${start} - ${end}`;
    }
    return `${format(from, "yyyy. MMMM d.", { locale: hu })} - ${format(to, "yyyy. MMMM d.", { locale: hu })}`;
  };

  const parseDateRange = (value: string | undefined | null): { from: Date | undefined; to: Date | undefined } => {
    if (!value) return { from: undefined, to: undefined };
    
    const months: Record<string, number> = {
      'január': 0, 'február': 1, 'március': 2, 'április': 3, 'május': 4, 'június': 5,
      'július': 6, 'augusztus': 7, 'szeptember': 8, 'október': 9, 'november': 10, 'december': 11
    };

    try {
      // 2024. május 12-14.
      const rangeMatch = value.match(/(\d{4})\.\s*([^\s\d\.]+)\s+(\d+)-(\d+)\./);
      if (rangeMatch) {
        const year = parseInt(rangeMatch[1]);
        const month = months[rangeMatch[2].toLowerCase()] ?? 0;
        const fromDay = parseInt(rangeMatch[3]);
        const toDay = parseInt(rangeMatch[4]);
        return { 
          from: new Date(year, month, fromDay), 
          to: new Date(year, month, toDay) 
        };
      }

      // 2024. május 30. - június 2.
      const crossMonthMatch = value.match(/(\d{4})\.\s*([^\s\d\.]+)\s+(\d+)\.\s*-\s*([^\s\d\.]+)\s+(\d+)\./);
      if (crossMonthMatch) {
        const year = parseInt(crossMonthMatch[1]);
        const fromMonth = months[crossMonthMatch[2].toLowerCase()] ?? 0;
        const fromDay = parseInt(crossMonthMatch[3]);
        const toMonth = months[crossMonthMatch[4].toLowerCase()] ?? 0;
        const toDay = parseInt(crossMonthMatch[5]);
        return { 
          from: new Date(year, fromMonth, fromDay), 
          to: new Date(year, toMonth, toDay) 
        };
      }

      // 2024. május 12.
      const singleMatch = value.match(/(\d{4})\.\s*([^\s\d\.]+)\s+(\d+)\./);
      if (singleMatch) {
         const year = parseInt(singleMatch[1]);
         const month = months[singleMatch[2].toLowerCase()] ?? 0;
         const day = parseInt(singleMatch[3]);
         return { from: new Date(year, month, day), to: undefined };
      }
    } catch (e) {
      console.error("Failed to parse date range:", e);
    }

    return { from: undefined, to: undefined };
  };

  const onSubmit: SubmitHandler<TrainingFormValues> = async (values) => {
    setIsPending(true);
    try {
      if (initialData) {
        await updateTraining(initialData.id, values);
        toast.success("Képzés sikeresen frissítve");
      } else {
        await createTraining(values);
        toast.success("Képzés sikeresen létrehozva");
      }
      router.push("/admin/trainings");
      router.refresh();
    } catch (error) {
      toast.error("Hiba történt a mentés során");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <Link href="/admin/trainings" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={18} />
            Vissza a listához
          </Link>
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 rounded-xl font-bold shadow-lg shadow-brand-orange/20"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Módosítások mentése" : "Képzés létrehozása"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card-bg border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="text-brand-orange" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Alapinformációk</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control as any}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Szint</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange/20 transition-all">
                            <SelectValue placeholder="Válassz szintet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-bg border-white/10 text-white rounded-xl">
                          <SelectItem value="basic">Kezdő</SelectItem>
                          <SelectItem value="intermediate">Középhaladó</SelectItem>
                          <SelectItem value="advanced">Haladó</SelectItem>
                          <SelectItem value="intensive">Intenzív</SelectItem>
                          <SelectItem value="tuning-fork">Hangvilla</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Képzés típusa</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange/20 transition-all">
                            <SelectValue placeholder="Válassz típust" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-bg border-white/10 text-white rounded-xl">
                          <SelectItem value="group">Csoportos képzés</SelectItem>
                          <SelectItem value="private">Egyéni magánoktatás</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="priceHuf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/60">Részvételi díj (Ft)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="pl. 55000"
                          className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-brand-orange/20 transition-all"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4">
                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-white/5 p-4 bg-white/5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-white">Aktív státusz</FormLabel>
                        <FormDescription className="text-white/40 text-xs">
                          Csak az aktív időpontok jelennek meg a nyilvános oldalon.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-brand-orange"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-card-bg border border-white/5 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="text-brand-orange" size={20} />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Többnyelvű tartalom</h2>
              </div>

              {/* Hungarian Section */}
              <div className="space-y-4 pt-4 border-l-2 border-brand-orange pl-4 bg-brand-orange/5 p-4 rounded-r-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <span className="text-lg">🇭🇺</span> Magyar (Alap)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control as any}
                    name="datesHu"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-white/60 flex items-center gap-2">
                          <Clock size={14} /> Időpontok
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "bg-white/5 border-white/10 text-white h-12 rounded-xl text-left font-normal hover:bg-white/10 hover:text-white",
                                  !field.value && "text-white/10"
                                )}
                              >
                                {field.value ? (
                                  field.value
                                ) : (
                                  <span>Válassz időpontot...</span>
                                )}
                                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-admin-bg border-white/10" align="start">
                            <Calendar
                              mode="range"
                              selected={parseDateRange(field.value)}
                              onSelect={(range) => {
                                if (range?.from) {
                                  field.onChange(formatDateRange(range.from, range.to));
                                }
                              }}
                              initialFocus
                              locale={hu}
                              className="text-white"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="locationHu"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/60 flex items-center gap-2">
                          <MapPin size={14} /> Helyszín
                        </FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/10"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* English Section */}
              <div className="space-y-4 pt-4 border-l-2 border-blue-400/30 pl-4 bg-white/5 p-4 rounded-r-xl">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-lg">🇬🇧</span> Angol
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="datesEn"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-white/40">Időpontok (EN)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "bg-white/5 border-white/10 text-white h-12 rounded-xl text-left font-normal hover:bg-white/10 hover:text-white",
                                    !field.value && "text-white/10"
                                  )}
                                >
                                  {field.value ? (
                                    field.value
                                  ) : (
                                    <span>Select date...</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-admin-bg border-white/10" align="start">
                              <Calendar
                                mode="range"
                                selected={parseDateRange(field.value)}
                                onSelect={(range) => {
                                  if (range?.from) {
                                    // Use English locale or plain format for EN dates
                                    field.onChange(formatDateRange(range.from, range.to));
                                  }
                                }}
                                initialFocus
                                className="text-white"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={form.control as any}
                    name="locationEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/40">Helyszín (EN)</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/10"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Slovak Section */}
              <div className="space-y-4 pt-4 border-l-2 border-red-400/30 pl-4 bg-white/5 p-4 rounded-r-xl">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-lg">🇸🇰</span> Szlovák
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control as any}
                      name="datesSk"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-white/40">Időpontok (SK)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "bg-white/5 border-white/10 text-white h-12 rounded-xl text-left font-normal hover:bg-white/10 hover:text-white",
                                    !field.value && "text-white/10"
                                  )}
                                >
                                  {field.value ? (
                                    field.value
                                  ) : (
                                    <span>Vyberte dátum...</span>
                                  )}
                                  <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-admin-bg border-white/10" align="start">
                              <Calendar
                                mode="range"
                                selected={parseDateRange(field.value)}
                                onSelect={(range) => {
                                  if (range?.from) {
                                    field.onChange(formatDateRange(range.from, range.to));
                                  }
                                }}
                                initialFocus
                                className="text-white"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  <FormField
                    control={form.control as any}
                    name="locationSk"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/40">Helyszín (SK)</FormLabel>
                        <FormControl>
                          <Input 
                            className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/10"
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tips/Side */}
          <div className="space-y-6">
            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-4 text-brand-orange">
                 <CalendarIcon size={20} />
                 <h3 className="font-bold uppercase tracking-wider text-sm">Súgó</h3>
               </div>
               <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                 <p>
                   A képzés mentése után az időpontok automatikusan megjelennek a nyilvános <Link href="/oktatasok" className="text-brand-orange hover:underline">/oktatasok</Link> oldalon a megfelelő kategóriában.
                 </p>
                 <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                    <p className="font-bold text-white text-xs uppercase mb-2">Tipp</p>
                    <p className="text-xs">
                      Ha többnyelvű látogatóid vannak, érdemes mindhárom nyelven kitölteni az időpontokat és helyszíneket a professzionális megjelenés érdekében.
                    </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
