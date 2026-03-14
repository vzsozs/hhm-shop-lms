"use client";

import React from "react";
import { 
  Calendar, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

// Types for the training data
export interface Training {
  id: string;
  level: string;
  type: string;
  priceHuf: number;
  datesHu: string | null;
  locationHu: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingsTableClientProps {
  initialTrainings: Training[];
}

export function TrainingsTableClient({ initialTrainings }: TrainingsTableClientProps) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredTrainings = initialTrainings.filter((training) => {
    const searchStr = `${training.level} ${training.type} ${training.locationHu} ${training.datesHu}`.toLowerCase();
    return searchStr.includes(searchTerm.toLowerCase());
  });

  const getLevelBadge = (level: string) => {
    const levels: Record<string, { label: string; color: string }> = {
      basic: { label: "Kezdő", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      intermediate: { label: "Középhaladó", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
      advanced: { label: "Haladó", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
      intensive: { label: "Intenzív", color: "bg-red-500/10 text-red-500 border-red-500/20" },
      "tuning-fork": { label: "Hangvilla", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    };
    const config = levels[level] || { label: level, color: "bg-gray-500/10 text-gray-500 border-gray-500/20" };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return type === "group" 
      ? <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">Csoportos</Badge>
      : <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">Egyéni</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card-bg p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <Input
            placeholder="Keresés szint, típus vagy helyszín alapján..."
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 h-10 rounded-xl focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <p className="text-xs text-white/40 font-medium">Összesen: {filteredTrainings.length} képzés</p>
        </div>
      </div>

      <div className="bg-card-bg border border-white/5 rounded-2xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-white/40 font-medium px-6 py-4">Képzés</TableHead>
              <TableHead className="text-white/40 font-medium px-6 py-4">Típus</TableHead>
              <TableHead className="text-white/40 font-medium px-6 py-4">Időpont & Helyszín</TableHead>
              <TableHead className="text-white/40 font-medium px-6 py-4">Ár</TableHead>
              <TableHead className="text-white/40 font-medium px-6 py-4">Státusz</TableHead>
              <TableHead className="text-white/40 font-medium px-6 py-4 text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainings.map((training) => (
              <TableRow key={training.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                <TableCell className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {getLevelBadge(training.level)}
                    </div>
                    <span className="text-xs text-white/30 font-medium italic mt-1">Létrehozva: {new Date(training.createdAt).toLocaleDateString('hu-HU')}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {getTypeBadge(training.type)}
                </TableCell>
                <TableCell className="px-6 py-4 text-white/70">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={14} className="text-brand-orange/50" />
                      <span className="line-clamp-1">{training.datesHu || "Nincs megadva"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <MapPin size={12} />
                      <span className="line-clamp-1">{training.locationHu || "Nincs megadva"}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 font-mono font-medium text-white">
                  {training.priceHuf.toLocaleString("hu-HU")} Ft
                </TableCell>
                <TableCell className="px-6 py-4">
                  {training.isActive ? (
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-semibold">
                      <CheckCircle2 size={14} />
                      <span>Aktív</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-white/30 text-xs font-semibold">
                      <XCircle size={14} />
                      <span>Inaktív</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg text-white/50">
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-admin-bg border-white/10 text-white rounded-xl shadow-2xl p-1">
                      <DropdownMenuItem asChild className="hover:bg-white/5 rounded-lg cursor-pointer">
                        <Link href={`/admin/trainings/${training.id}`} className="flex items-center gap-2 w-full">
                          <Edit size={14} className="text-brand-orange" /> Szerkesztés
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-red-500/10 text-red-400 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          <Trash2 size={14} /> Törlés
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredTrainings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center text-white/30 font-medium">
                  <div className="flex flex-col items-center gap-3">
                     <Calendar className="opacity-10" size={48} />
                     <p>Nem található a keresésnek megfelelő képzés</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
