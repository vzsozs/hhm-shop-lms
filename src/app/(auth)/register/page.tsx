"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/modules/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().min(2, "A név megadása kötelező!"),
  email: z.string().email("Kérlek, adj meg egy érvényes e-mail címet!"),
  password: z.string().min(6, "A jelszónak legalább 6 karakternek kell lennie!"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (values: RegisterFormValues) => {
    startTransition(async () => {
      const result = await registerUser(values);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.success || "Sikeres regisztráció!");
        router.push("/login"); // Váltás loginra
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Regisztráció</h2>
        <p className="text-sm text-white/50">Hozd létre az egységes fiókodat.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/70">Név</Label>
          <Input 
            {...register("name")}
            placeholder="Szabó Péter" 
            className="bg-white/5 border-white/10 text-white focus-visible:ring-brand-orange"
          />
          {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
        </div>

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
          <Label className="text-white/70">Jelszó</Label>
          <Input 
            {...register("password")}
            type="password" 
            placeholder="Legalább 6 karakter" 
            className="bg-white/5 border-white/10 text-white focus-visible:ring-brand-orange"
          />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-medium h-11"
        >
          {isPending ? "Regisztráció folyamatban..." : "Fiók létrehozása"}
        </Button>
      </form>

      <p className="text-center text-sm text-white/50">
        Már van fiókod?{" "}
        <Link href="/login" className="text-brand-orange hover:text-brand-orange/80 transition-colors font-medium">
          Lépj be itt!
        </Link>
      </p>
    </div>
  );
}
