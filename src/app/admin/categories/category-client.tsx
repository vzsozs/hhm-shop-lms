"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { CategoryForm } from "./category-form";
import { deleteCategory } from "@/modules/shop/actions";
import { toast } from "sonner";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CategoryNode = any; // TODO: type export

interface CategoryClientProps {
  categories: CategoryNode[];
  flatCategories: { id: string; name: string }[];
}

export function CategoryClient({ categories, flatCategories }: CategoryClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryNode | null>(null);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isPendingDelete, startTransitionDelete] = useTransition();

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: CategoryNode) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!categoryToDelete) return;
    
    startTransitionDelete(async () => {
      const result = await deleteCategory(categoryToDelete);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Kategória törölve.");
      }
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategóriák</h1>
          <p className="text-sm text-white/50 mt-1">Webshop termékkategóriák kezelése több nyelven.</p>
        </div>
        <Button onClick={handleCreate} className="px-4 h-10 bg-brand-orange hover:bg-brand-orange/90 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-colors shadow-lg shadow-brand-orange/20">
          <Plus size={18} />
          Új Kategória felvitele
        </Button>
      </div>

      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-b-white/10 hover:bg-transparent">
                <TableHead className="text-white w-2/5">Kategória Név (HU)</TableHead>
                <TableHead className="text-white">URL Slug</TableHead>
                <TableHead className="text-white">Szülő Kat.</TableHead>
                <TableHead className="text-white text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => {
                const nameHu = cat.name?.hu || "Névtelen";
                
                return (
                  <TableRow key={cat.id} className="border-b-white/5 hover:bg-white/5 border-b last:border-0 transition-colors">
                    <TableCell className="font-medium text-white flex items-center">
                      {/* Vizuális hierarchia behúzása */}
                      {cat.depth > 0 && (
                        <span className="text-white/30 mr-2 ml-4">└──</span>
                      )}
                      {nameHu}
                    </TableCell>
                    <TableCell className="text-white/70 text-sm">{typeof cat.slug === 'object' && cat.slug !== null ? cat.slug.hu || Object.values(cat.slug)[0] : String(cat.slug)}</TableCell>
                    <TableCell className="text-white/50 text-sm">
                      {cat.depth > 0 ? cat.parentNameHu : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(cat)}
                          className="h-8 w-8 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeletePrompt(cat.id)}
                          className="h-8 w-8 border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-white/50">
                    Nincsenek kategóriák. Hozz létre egyet!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white mb-4">
              {editingCategory ? "Kategória szerkesztése" : "Új kategória létrehozása"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm 
            initialData={editingCategory} 
            categories={flatCategories} 
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd a kategóriát?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Ez a művelet nem vonható vissza. Ha a kategóriához tartoznak termékek, azokról lekerül ez a címke (vagy törlődnek a set null/cascade beállítástól függően). Az alkategóriák parentId-ja NULL lesz.
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
              Kategória törlése
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
