"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { sendTestEmailAction } from "@/lib/email/actions";

export function TestEmailButton() {
  const [isPending, startTransition] = useTransition();

  const handleSendTestEmail = () => {
    startTransition(async () => {
      const result = await sendTestEmailAction();
      
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        if (result.success.includes("Szimulált")) {
           toast.warning(result.success);
        } else {
           toast.success(result.success);
        }
      }
    });
  };

  return (
    <Button 
      onClick={handleSendTestEmail} 
      disabled={isPending}
      variant="outline"
      className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white/70"
    >
      <Mail className="w-4 h-4 mr-2" />
      {isPending ? "Küldés folyamatban..." : "Teszt e-mail küldése (Saját címre)"}
    </Button>
  );
}
