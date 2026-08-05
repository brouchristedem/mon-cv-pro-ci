"use client";

import { useMemo, useState } from "react";
import { useCVStore } from "@/lib/store";
import { computeCompleteness } from "@/lib/cvCompleteness";
import { UI } from "@/lib/i18n";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

export default function CompletenessScore() {
  const cv = useCVStore((s) => s.cv);
  const t = UI[cv.langue];
  const [open, setOpen] = useState(false);
  const { percent, tipKeys } = useMemo(() => computeCompleteness(cv), [cv]);

  const barColor =
    percent >= 80 ? "bg-green-500" : percent >= 40 ? "bg-blue-600" : "bg-amber-500";

  return (
    <div className="px-3 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">
          {t.completeness}
        </span>
        <span className="flex items-center gap-1 text-[11px] font-semibold tabular-nums text-foreground/70">
          {percent}%
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </span>
      </button>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {open && (
        <div className="mt-2 space-y-1.5 pb-1">
          {tipKeys.length === 0 ? (
            <p className="flex items-start gap-1.5 text-[11px] text-green-600">
              <Sparkles size={12} className="flex-shrink-0 mt-0.5" />
              {t.completenessDone}
            </p>
          ) : (
            tipKeys.map((key) => (
              <p key={key} className="text-[11px] text-foreground/60 leading-snug">
                • {t[key as keyof typeof t]}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
}
