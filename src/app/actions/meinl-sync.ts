"use server";

import { revalidatePath } from "next/cache";
import { syncMeinlData } from "@/services/meinlSyncService";
import { auth } from "@/auth"; // Feltételezve hogy van auth

export async function uploadMeinlFile(formData: FormData) {
  try {
    const session = await auth();
    const user = session?.user as { role?: string } | undefined;
    if (!session || user?.role !== "admin") {
      return { success: false, error: "Nincs jogosultságod ehhez a művelethez." };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Nem található fájl a feltöltésben." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await syncMeinlData(buffer);

    revalidatePath("/admin/products");
    
    return { 
      success: true, 
      processed: result.processed,
      updated: result.updated,
      inserted: result.inserted,
      deactivated: result.deactivated,
      successSkus: result.successSkus,
      errorSkus: result.errorSkus,
      skippedSkus: result.skippedSkus,
      errors: result.errors 
    };

  } catch (error) {
    console.error("Meinl Sync Error:", error);
    const message = error instanceof Error ? error.message : "Váratlan hiba történt a szinkronizáció során.";
    return { success: false, error: message };
  }
}
