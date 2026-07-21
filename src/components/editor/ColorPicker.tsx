"use client";

import { useCVStore } from "@/lib/store";
import { UI } from "@/lib/i18n";

const PALETTE = [
  "#2563eb", "#0891b2", "#059669", "#16a34a", "#65a30d",
  "#ca8a04", "#d97706", "#ea580c", "#dc2626", "#e11d48",
  "#db2777", "#c026d3", "#9333ea", "#7c3aed", "#4f46e5",
  "#0f172a", "#334155", "#78716c", "#1e293b", "#0d9488",
];

const BG_PALETTE = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#fef9f5", "#fefce8",
  "#f0fdf4", "#eff6ff", "#faf5ff", "#fdf2f8", "#fef2f2",
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
      <div className="pt-2 border-t border-border">
        <label className="text-xs text-foreground/60 block mb-2">{t.backgroundColor}</label>
        <div className="grid grid-cols-8 gap-2 mb-2">
          {BG_PALETTE.map((bg) => (
            <button
              key={bg}
              onClick={() => set((c) => ({ ...c, couleurFond: bg }))}
              className={`w-8 h-8 rounded-full border-2 transition ${
                cv.couleurFond === bg ? "border-foreground scale-110" : "border-border"
              }`}
              style={{ background: bg }}
              aria-label={bg}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={cv.couleurFond}
            onChange={(e) => set((c) => ({ ...c, couleurFond: e.target.value }))}
            className="w-8 h-8 rounded cursor-pointer bg-transparent border border-border"
          />
          <button
            onClick={() => set((c) => ({ ...c, couleurFond: "#ffffff" }))}
            className="text-[11px] text-foreground/40 hover:text-foreground/70 underline"
          >
            {t.resetWhite}
          </button>
        </div>
      </div>
    </div>
  );
}
