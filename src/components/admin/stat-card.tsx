import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <div className="bg-card-bg border border-white/5 rounded-2xl p-6 relative flex flex-col justify-between overflow-hidden shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60">{title}</h3>
        <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {description && (
          <p className="text-xs text-white/40 flex items-center gap-1 mt-2">
            {trend === "up" && <span className="text-emerald-500 font-medium">↑</span>}
            {trend === "down" && <span className="text-red-500 font-medium">↓</span>}
            {trend === "neutral" && <span className="text-white/60 font-medium">-</span>}
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
