"use client";

import { useCVStore } from "@/lib/store";
import { UI } from "@/lib/i18n";

const PALETTE = [
  "#2563eb", "#0891b2", "#059669", "#16a34a", "#65a30d",
  "#ca8a04", "#d97706", "#ea580c", "#dc2626", "#e11d48",
  "#db2777", "#c026d3", "#9333ea", "#7c3aed", "#4f46e5",
  "#0f172a", "#334155", "#78716c", "#1e293b", "#0d9488",
];

export default function ColorPicker() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const t = UI[cv.langue];

  const setColor = (color: string) => set((c) => ({ ...c, couleurPrimaire: color }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-8 gap-2">
        {PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setColor(color)}
            className={`w-8 h-8 rounded-full border-2 transition ${
              cv.couleurPrimaire === color ? "border-foreground scale-110" : "border-transparent"
            }`}
            style={{ background: color }}
            aria-label={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1">
        <label className="text-xs text-foreground/60">{t.customColor}</label>
        <input
          type="color"
          value={cv.couleurPrimaire}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
        />
      </div>
    </div>
  );
}
