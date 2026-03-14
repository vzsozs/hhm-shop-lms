"use client";

import { useState, useTransition, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Award, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductGroupForm } from "./product-group-form";
import { deleteProductGroup } from "@/modules/shop/actions";
import { toast } from "sonner";

interface ProductInGroup {
  id: string;
  name: Record<string, string>;
}

interface ProductGroup {
  id: string;
  name: Record<string, string>;
  slug: Record<string, string>;
  products: ProductInGroup[];
}

interface ProductGroupsClientProps {
  groups: ProductGroup[];
}

export function ProductGroupsClient({ groups }: ProductGroupsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const handleEdit = (group: ProductGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    setGroupToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!groupToDelete) return;
    
    startTransitionDelete(async () => {
      const result = await deleteProductGroup(groupToDelete);
      if (result.success) {
        toast.success("Termékcsalád törölve.");
      } else {
        toast.error(result.error || "Hiba történt a törlés során.");
      }
      setIsDeleteDialogOpen(false);
      setGroupToDelete(null);
    });
  };

  const toggleGroup = (id: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <>
      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b-white/10 hover:bg-transparent">
                <TableHead className="w-10"></TableHead>
                <TableHead className="text-white">Termékcsalád Név (HU)</TableHead>
                <TableHead className="text-white">Tagok száma</TableHead>
                <TableHead className="text-white">URL Slug (HU)</TableHead>
                <TableHead className="text-white text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => {
                const nameHu = group.name?.hu || "Névtelen";
                const isExpanded = expandedGroups.has(group.id);
                
                return (
                  <Fragment key={group.id}>
                    <TableRow className="border-b-white/5 hover:bg-white/5 border-b transition-colors cursor-pointer" onClick={() => toggleGroup(group.id)}>
                      <TableCell>
                        {group.products.length > 0 && (
                          isExpanded ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {nameHu}
                      </TableCell>
                      <TableCell className="text-white/70 text-sm">
                        {group.products.length} termék
                      </TableCell>
                      <TableCell className="text-white/50 text-sm">
                        {group.slug?.hu || "-"}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(group)}
                            className="h-8 w-8 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeletePrompt(group.id)}
                            className="h-8 w-8 border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && group.products.length > 0 && (
                      <TableRow className="bg-white/[0.02] hover:bg-white/[0.02] border-b-white/5">
                        <TableCell colSpan={5} className="py-4 pl-12">
                          <div className="flex flex-wrap gap-2">
                            {group.products.map((product) => (
                              <div key={product.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70">
                                {product.name?.hu || product.id}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-white/50">
                    Nincsenek termékcsaládok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <Award className="text-brand-orange" size={24} />
              Termékcsalád szerkesztése
            </DialogTitle>
          </DialogHeader>
          {editingGroup && (
            <ProductGroupForm 
              initialData={editingGroup} 
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd a termékcsaládot?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ez a művelet nem vonható vissza. A termékcsalád tagjai megmaradnak, de lekerül róluk a csoporthoz tartozás (groupId = NULL lesz).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-colors">
              Mégse
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isPendingDelete}
              className="bg-red-500 hover:bg-red-600 text-white transition-colors"
            >
              Törlés
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
