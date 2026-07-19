"use client";

import { useState } from "react";
import { useCVStore } from "@/lib/store";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import CVPreviewFit from "@/components/templates/CVPreviewFit";
import { Eye, Check, X } from "lucide-react";
import { UI } from "@/lib/i18n";

export default function TemplatePicker() {
  const cv = useCVStore((s) => s.cv);
  const set = useCVStore((s) => s.set);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const t = UI[cv.langue];

  const selectTemplate = (id: string) => set((c) => ({ ...c, templateId: id }));
  const active = TEMPLATE_LIST.filter((tpl) => tpl.actif);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {active.map((tpl) => (
          <div
            key={tpl.id}
            className={`relative text-left p-2.5 rounded-lg border text-xs transition ${
              cv.templateId === tpl.id
                ? "border-blue-600 bg-blue-600/10"
                : "border-border hover:bg-surface-muted"
            }`}
          >
            <button onClick={() => selectTemplate(tpl.id)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <span className="font-medium">{tpl.nom}</span>
                {cv.templateId === tpl.id && <Check size={13} className="text-blue-600" />}
              </div>
              <p className="text-[10px] text-foreground/50 mt-0.5 pr-4">{tpl.style}</p>
            </button>
            <button
              onClick={() => setPreviewId(tpl.id)}
              className="absolute bottom-1.5 right-1.5 text-foreground/40 hover:text-blue-600 p-1"
              aria-label={t.preview}
            >
              <Eye size={13} />
            </button>
          </div>
        ))}
      </div>

      {previewId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="bg-surface rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">
                {TEMPLATE_LIST.find((tpl) => tpl.id === previewId)?.nom}
              </span>
              <button onClick={() => setPreviewId(null)} className="p-1 hover:bg-surface-muted rounded-lg">
                <X size={16} />
              </button>
            </div>
            <CVPreviewFit cv={{ ...cv, templateId: previewId }} />
            <button
              onClick={() => {
                selectTemplate(previewId);
                setPreviewId(null);
              }}
              className="w-full mt-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
            >
              <Check size={14} className="inline mr-1" /> {t.chooseTemplate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
