"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { toast } from "sonner";
import { toggleUserRole } from "@/modules/auth/actions";

interface UserActionsProps {
  userId: string;
  currentRole: "admin" | "user";
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const isAdmin = currentRole === "admin";

  const handleToggleRole = () => {
    const newRole = isAdmin ? "user" : "admin";
    startTransition(async () => {
      const result = await toggleUserRole(userId, newRole);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleRole}
      disabled={isPending}
      className={`border-white/10 hover:border-white/20 transition-colors h-8 text-xs ${
        isAdmin 
          ? "bg-white/5 hover:bg-white/10 text-white" 
          : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange"
      }`}
    >
      {isPending ? (
        "Frissítés..."
      ) : isAdmin ? (
        <>
          <User className="w-3.5 h-3.5 mr-1" />
          User-é alakít
        </>
      ) : (
        <>
          <Shield className="w-3.5 h-3.5 mr-1" />
          Adminná tesz
        </>
      )}
    </Button>
  );
}
