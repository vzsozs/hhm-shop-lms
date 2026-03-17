"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Shield, User, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { toggleUserRole, deleteUser } from "@/modules/auth/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserActionsProps {
  userId: string;
  currentRole: "admin" | "user";
  currentUserId?: string;
}

export function UserActions({ userId, currentRole, currentUserId }: UserActionsProps) {
  const [isPendingRole, startTransitionRole] = useTransition();
  const [isPendingDelete, startTransitionDelete] = useTransition();
  const isAdmin = currentRole === "admin";
  const isSelf = currentUserId === userId;

  const handleToggleRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newRole = isAdmin ? "user" : "admin";
    startTransitionRole(async () => {
      const result = await toggleUserRole(userId, newRole);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  };

  const handleDeleteUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransitionDelete(async () => {
      const result = await deleteUser(userId);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-white/10 hover:border-white/20 transition-colors h-8 text-xs bg-white/5 hover:bg-white/10 text-white"
      >
        <Link href={`/admin/users/${userId}`} onClick={(e) => e.stopPropagation()}>
          <Edit className="w-3.5 h-3.5 mr-1" />
          Szerkesztés
        </Link>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleRole}
        disabled={isPendingRole || isSelf}
        className={`border-white/10 hover:border-white/20 transition-colors h-8 text-xs ${
          isAdmin 
            ? "bg-white/5 hover:bg-white/10 text-white" 
            : "bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange"
        }`}
      >
        {isPendingRole ? (
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

      <AlertDialog>
        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="icon"
            disabled={isPendingDelete || isSelf}
            className="h-8 w-8 border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-neutral-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd ezt a felhasználót?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ez a művelet nem vonható vissza. A felhasználó összes adata, beleértve a profilját, a címeit és a kurzusokhoz való hozzáférését, véglegesen törlésre kerül az adatbázisból.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-colors">
              Mégse
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => handleDeleteUser(e)}
              className="bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Fiók törlése
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
