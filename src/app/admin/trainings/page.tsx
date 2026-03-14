import Link from "next/link";
import { 
  Calendar,
  Plus
} from "lucide-react";
import { db } from "@/db";
import { trainings } from "@/db/schema/lms";
import { desc } from "drizzle-orm";
import { TrainingsTableClient } from "./trainings-table-client";

export const dynamic = "force-dynamic";

export default async function AdminTrainingsPage() {
  const trainingsList = await db
    .select()
    .from(trainings)
    .orderBy(desc(trainings.createdAt));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calendar className="text-brand-orange" size={28} />
            Oktatások
          </h1>
          <p className="text-sm text-white/50 mt-1">Képzések időpontjainak és árainak kezelése</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/trainings/new" className="px-4 h-10 bg-brand-orange hover:bg-brand-orange/90 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-colors shadow-lg shadow-brand-orange/20">
            <Plus size={18} />
            Új időpont felvitele
          </Link>
        </div>
      </div>

      <TrainingsTableClient 
        initialTrainings={trainingsList} 
      />
    </div>
  );
}
