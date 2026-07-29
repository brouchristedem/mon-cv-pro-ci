"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import { demoCV } from "@/lib/demoCV";
import CVPreviewFit from "@/components/templates/CVPreviewFit";

export default function TemplateGallery() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const active = TEMPLATE_LIST.filter((tpl) => tpl.actif);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-end gap-2 mb-3">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Précédent"
          className="p-2 rounded-full border border-border hover:bg-surface-muted transition"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scrollBy(1)}
          aria-label="Suivant"
          className="p-2 rounded-full border border-border hover:bg-surface-muted transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-px-6 -mx-6 px-6"
        style={{ scrollbarWidth: "thin" }}
      >
        {active.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/editor?template=${tpl.id}`}
            className="group shrink-0 w-[200px] sm:w-[240px] snap-start rounded-xl border border-border bg-surface overflow-hidden hover:border-blue-600 hover:shadow-lg transition"
          >
            <div className="pointer-events-none">
              <CVPreviewFit cv={demoCV(tpl.id)} />
            </div>
            <div className="p-3 border-t border-border">
              <p className="font-semibold text-sm truncate">{tpl.nom}</p>
              <p className="text-[11px] text-foreground/50 mt-0.5 line-clamp-1">{tpl.style}</p>
              <span className="inline-block mt-2 text-xs font-medium text-blue-600 group-hover:underline">
                Utiliser ce modèle →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
