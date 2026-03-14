import { TrainingForm } from "../training-form";
import { 
  Calendar, 
} from "lucide-react";

export default function NewTrainingPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Calendar className="text-brand-orange" size={28} />
          Új időpont felvitele
        </h1>
        <p className="text-sm text-white/50 mt-1">Adj hozzá egy új képzési időpontot a rendszerhez</p>
      </div>

      <TrainingForm />
    </div>
  );
}
