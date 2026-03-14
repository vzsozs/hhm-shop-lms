"use server";

import { db } from "@/db";
import { trainings } from "@/db/schema/lms";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TrainingSchema = z.object({
  level: z.string().min(1),
  type: z.string().min(1),
  priceHuf: z.number().min(0),
  datesHu: z.string().optional().nullable(),
  datesEn: z.string().optional().nullable(),
  datesSk: z.string().optional().nullable(),
  locationHu: z.string().optional().nullable(),
  locationEn: z.string().optional().nullable(),
  locationSk: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function createTraining(data: z.infer<typeof TrainingSchema>) {
  try {
    const validatedData = TrainingSchema.parse(data);
    await db.insert(trainings).values({
      ...validatedData,
      updatedAt: new Date(),
    });
    revalidatePath("/admin/trainings");
    revalidatePath("/oktatasok");
    return { success: true };
  } catch (error) {
    console.error("Error creating training:", error);
    return { success: false, error: "Failed to create training" };
  }
}

export async function updateTraining(id: string, data: z.infer<typeof TrainingSchema>) {
  try {
    const validatedData = TrainingSchema.parse(data);
    await db.update(trainings)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(trainings.id, id));
    revalidatePath("/admin/trainings");
    revalidatePath("/oktatasok");
    return { success: true };
  } catch (error) {
    console.error("Error updating training:", error);
    return { success: false, error: "Failed to update training" };
  }
}

export async function deleteTraining(id: string) {
  try {
    await db.delete(trainings).where(eq(trainings.id, id));
    revalidatePath("/admin/trainings");
    revalidatePath("/oktatasok");
    return { success: true };
  } catch (error) {
    console.error("Error deleting training:", error);
    return { success: false, error: "Failed to delete training" };
  }
}
