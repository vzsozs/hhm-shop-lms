"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getBadgeIcons, getAllBadgeSettings, upsertBadgeSettings } from "@/modules/shop/actions";
import { Loader2, Settings, Save } from "lucide-react";

interface BadgeSetting {
  iconName: string;
  tooltips: {
    hu: string;
    en: string;
    sk: string;
  };
}

export default function SettingsPage() {
  const [icons, setIcons] = useState<string[]>([]);
  const [settings, setSettings] = useState<Record<string, BadgeSetting>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [availableIcons, existingSettings] = await Promise.all([
          getBadgeIcons(),
          getAllBadgeSettings()
        ]);
        
        setIcons(availableIcons);
        
        const settingsMap: Record<string, BadgeSetting> = {};
        existingSettings.forEach((s: any) => {
          settingsMap[s.iconName] = {
            iconName: s.iconName,
            tooltips: (s.tooltips as any) || { hu: "", en: "", sk: "" }
          };
        });
        
        setSettings(settingsMap);
      } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error);
        toast.error("Nem sikerült betölteni a beállításokat.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTooltipChange = (icon: string, lang: 'hu' | 'en' | 'sk', value: string) => {
    setSettings(prev => ({
      ...prev,
      [icon]: {
        iconName: icon,
        tooltips: {
          ...(prev[icon]?.tooltips || { hu: "", en: "", sk: "" }),
          [lang]: value
        }
      }
    }));
  };

  const handleSave = async (icon: string) => {
    setSaving(icon);
    try {
      const result = await upsertBadgeSettings(settings[icon] || {
        iconName: icon,
        tooltips: { hu: "", en: "", sk: "" }
      });
      
      if (result.success) {
        toast.success(`"${icon}" mentve.`);
      } else {
        toast.error("Hiba a mentés során.");
      }
    } catch (error) {
      console.error("Mentési hiba:", error);
      toast.error("Váratlan hiba történt.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-brand-orange" />
          Általános Beállítások
        </h1>
        <p className="text-white/50">Globális beállítások és testreszabás.</p>
      </div>

      <Card className="bg-admin-card border-white/5 shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5 px-8 py-6">
          <CardTitle className="text-xl text-brand-orange">Badge Tooltipek Kezelése</CardTitle>
          <p className="text-sm text-white/40 mt-1">
            Itt állíthatod be a termékeken megjelenő badge-ek felugró szövegeit mindhárom nyelven.
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 gap-8">
            {icons.length === 0 ? (
              <p className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-xl italic">
                Nincsenek elérhető badge ikonok a rendszerben.
              </p>
            ) : (
              icons.map((icon) => (
                <div 
                  key={icon} 
                  className="group bg-white/5 rounded-2xl border border-white/5 hover:border-brand-orange/30 transition-all duration-300 p-6 flex flex-col md:flex-row gap-8 items-start md:items-center"
                >
                  <div className="flex flex-col items-center gap-3 min-w-[120px]">
                    <div className="w-20 h-20 rounded-full bg-brand-orange/10 flex items-center justify-center p-3 border border-brand-orange/20 shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <div className="relative w-full h-full">
                        <Image
                          src={`/assets/badges/${icon}`}
                          alt={icon}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <span className="text-xs font-mono text-white/40 truncate w-full text-center" title={icon}>
                      {icon}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-brand-orange/60 tracking-wider">Magyar (HU)</label>
                      <Input
                        value={settings[icon]?.tooltips.hu || ""}
                        onChange={(e) => handleTooltipChange(icon, 'hu', e.target.value)}
                        placeholder="Pl: Prémium minőség"
                        className="bg-brand-black/40 border-white/10 focus:border-brand-orange/50 transition-all h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-brand-orange/60 tracking-wider">English (EN)</label>
                      <Input
                        value={settings[icon]?.tooltips.en || ""}
                        onChange={(e) => handleTooltipChange(icon, 'en', e.target.value)}
                        placeholder="Eg: Premium quality"
                        className="bg-brand-black/40 border-white/10 focus:border-brand-orange/50 transition-all h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-brand-orange/60 tracking-wider">Slovensky (SK)</label>
                      <Input
                        value={settings[icon]?.tooltips.sk || ""}
                        onChange={(e) => handleTooltipChange(icon, 'sk', e.target.value)}
                        placeholder="Napr: Prémiová kvalita"
                        className="bg-brand-black/40 border-white/10 focus:border-brand-orange/50 transition-all h-11"
                      />
                    </div>
                  </div>

                  <div className="md:self-center flex items-center justify-end">
                    <Button
                      onClick={() => handleSave(icon)}
                      disabled={saving === icon}
                      className="bg-brand-orange hover:bg-brand-orange/80 text-white rounded-xl h-11 px-6 shadow-lg shadow-brand-orange/20 transition-all active:scale-95"
                    >
                      {saving === icon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Mentés
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
