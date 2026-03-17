"use client";

import { useTransition } from "react";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userAdminUpdateSchema } from "@/modules/auth/schemas";
import { updateUserByAdmin } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Shield, MapPin, Briefcase, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { productFormStyles as styles } from "@/modules/shop/components/product-form.styles";

export type UserFormValues = z.infer<typeof userAdminUpdateSchema>;

interface UserFormProps {
  userId: string;
  email: string;
  initialData: Partial<UserFormValues>;
}

export function UserForm({ userId, email, initialData }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userAdminUpdateSchema) as unknown as Resolver<UserFormValues>,
    defaultValues: {
      role: (initialData.role as "admin" | "user") || "user",
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      phone: initialData.phone || "",
      lang: (initialData.lang as string) || "hu",
      expertise: initialData.expertise || "",
      interests: initialData.interests || "",
      billing_country: initialData.billing_country || "",
      billing_zip: initialData.billing_zip || "",
      billing_city: initialData.billing_city || "",
      billing_street: initialData.billing_street || "",
      billing_companyName: initialData.billing_companyName || "",
      billing_taxNumber: initialData.billing_taxNumber || "",
      shipping_country: initialData.shipping_country || "",
      shipping_zip: initialData.shipping_zip || "",
      shipping_city: initialData.shipping_city || "",
      shipping_street: initialData.shipping_street || "",
    } as UserFormValues,
  });

  const onSubmit = async (values: UserFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateUserByAdmin(userId, values);
        if (result.success) {
          toast.success("Felhasználó sikeresen frissítve");
          router.refresh();
        } else {
          toast.error(result.error || "Hiba történt a mentés során");
        }
      } catch (err) {
        console.error(err);
        toast.error("Váratlan hiba történt");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className={styles.container}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={`${styles.cardTitle} flex items-center gap-3`}>
              <User className="text-brand-orange" size={24} />
              Felhasználó szerkesztése
            </CardTitle>
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex text-sm text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10 items-center gap-2">
                <Mail size={14} />
                {email}
              </span>
              <Button type="submit" className={styles.primaryButton} disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mentés...
                  </>
                ) : "Mentés"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            
            {/* Fiók Adatok szekció */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange mb-2">
                <Shield size={18} />
                <h3 className="font-semibold text-white">Fiók adatok</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className={styles.sectionContent}>
                      <FormLabel className={styles.label}>Szerepkör</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={styles.inputWrapper}>
                            <SelectValue placeholder="Válassz szerepkört" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-bg border-white/10 text-white">
                          <SelectItem value="user">User (Tanuló)</SelectItem>
                          <SelectItem value="admin">Adminisztrátor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lang"
                  render={({ field }) => (
                    <FormItem className={styles.sectionContent}>
                      <FormLabel className={styles.label}>Nyelv</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={styles.inputWrapper}>
                            <SelectValue placeholder="Válassz nyelvet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-admin-bg border-white/10 text-white">
                          <SelectItem value="hu">Magyar (HU)</SelectItem>
                          <SelectItem value="en">English (EN)</SelectItem>
                          <SelectItem value="sk">Slovenský (SK)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Személyes Adatok szekció */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange mb-2">
                <Info size={18} />
                <h3 className="font-semibold text-white">Személyes adatok</h3>
              </div>
              <div className={styles.sectionContent}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.label}>Vezetéknév</FormLabel>
                        <FormControl>
                          <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.label}>Keresztnév</FormLabel>
                        <FormControl>
                          <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
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
                        <FormLabel className={styles.label}>Telefonszám</FormLabel>
                        <FormControl>
                          <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Szakmai Profil szekció */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-brand-orange mb-2">
                <Briefcase size={18} />
                <h3 className="font-semibold text-white">Szakmai profil</h3>
              </div>
              <div className={styles.sectionContent}>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="expertise"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.label}>Szakterület</FormLabel>
                        <FormControl>
                          <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={styles.label}>Érdeklődési kör</FormLabel>
                        <FormControl>
                          <Textarea className={`${styles.inputWrapper} ${styles.input} min-h-[100px]`} {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Cím adatok szekció */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Számlázási cím */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-orange mb-2">
                  <MapPin size={18} />
                  <h3 className="font-semibold text-white">Számlázási adatok</h3>
                </div>
                <div className={styles.sectionContent}>
                   <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="billing_companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={styles.label}>Cégnév / Név</FormLabel>
                            <FormControl>
                              <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="billing_taxNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={styles.label}>Adószám</FormLabel>
                            <FormControl>
                              <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name="billing_zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={styles.label}>Ir. szám</FormLabel>
                                  <FormControl>
                                    <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>
                         <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="billing_city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={styles.label}>Város</FormLabel>
                                  <FormControl>
                                    <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="billing_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={styles.label}>Utca, házszám</FormLabel>
                            <FormControl>
                              <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                   </div>
                </div>
              </div>

              {/* Szállítási cím */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-orange mb-2">
                  <MapPin size={18} />
                  <h3 className="font-semibold text-white">Szállítási adatok</h3>
                </div>
                <div className={styles.sectionContent}>
                   <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-3 gap-4">
                         <div className="col-span-1">
                            <FormField
                              control={form.control}
                              name="shipping_zip"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={styles.label}>Ir. szám</FormLabel>
                                  <FormControl>
                                    <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>
                         <div className="col-span-2">
                            <FormField
                              control={form.control}
                              name="shipping_city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={styles.label}>Város</FormLabel>
                                  <FormControl>
                                    <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                         </div>
                      </div>
                      <FormField
                        control={form.control}
                        name="shipping_street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={styles.label}>Utca, házszám</FormLabel>
                            <FormControl>
                              <Input className={`${styles.inputWrapper} ${styles.input}`} {...field} value={field.value || ""} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                   </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
