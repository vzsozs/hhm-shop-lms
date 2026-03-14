import { db } from "@/db";
import { trainings } from "@/db/schema/lms";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TrainingForm } from "../training-form";
import { Calendar } from "lucide-react";

interface EditTrainingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTrainingPage({ params }: EditTrainingPageProps) {
  const { id } = await params;
  
  const [training] = await db
    .select()
    .from(trainings)
    .where(eq(trainings.id, id))
    .limit(1);

  if (!training) {
    notFound();
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calendar className="text-brand-orange" size={28} />
          Képzés szerkesztése
        </h1>
        <p className="text-sm text-white/50 mt-1">Szerkeszd a kiválasztott képzési időpont részleteit</p>
      </div>

      <TrainingForm initialData={training} />
    </div>
  );
}
