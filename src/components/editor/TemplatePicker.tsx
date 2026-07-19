"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import CVRenderer from "@/components/templates/CVRenderer";
import { Eye, Check } from "lucide-react";
import { UI } from "@/lib/i18n";

export default function TemplatePicker() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const t = UI[cv.langue];

  const selectTemplate = (id: string) => set((c) => ({ ...c, templateId: id }));
  const active = TEMPLATE_LIST.filter((t) => t.actif);
  const shown = previewId || cv.templateId;

  return (
    <div className="flex gap-4">
      <div className="grid grid-cols-2 gap-2 flex-1">
        {active.map((tpl) => (
          <button
            key={tpl.id}
            onMouseEnter={() => setPreviewId(tpl.id)}
            onMouseLeave={() => setPreviewId(null)}
            onClick={() => selectTemplate(tpl.id)}
            className={`relative text-left p-2.5 rounded-lg border text-xs transition ${
              cv.templateId === tpl.id
                ? "border-blue-600 bg-blue-600/10"
                : "border-border hover:bg-surface-muted"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{tpl.nom}</span>
              {cv.templateId === tpl.id && <Check size={13} className="text-blue-600" />}
            </div>
            <p className="text-[10px] text-foreground/50 mt-0.5">{tpl.style}</p>
            <span className="absolute bottom-1.5 right-1.5 text-foreground/30">
              <Eye size={12} />
            </span>
          </button>
        ))}
      </div>

      <div className="hidden lg:block w-[180px] flex-shrink-0">
        <p className="text-[10px] text-foreground/50 mb-1">{t.preview}</p>
        <div className="border border-border rounded-lg overflow-hidden shadow-sm" style={{ aspectRatio: "210/297" }}>
          <div className="w-[210mm] h-[297mm] origin-top-left" style={{ transform: "scale(0.155)" }}>
            <CVRenderer cv={{ ...cv, templateId: shown }} />
          </div>
        </div>
      </div>
    </div>
  );
}
