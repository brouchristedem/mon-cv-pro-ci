"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TEMPLATE_LIST } from "@/lib/templateRegistry";
import { demoCV } from "@/lib/demoCV";
import TemplateThumbnail from "./TemplateThumbnail";

// Une couleur d'accent différente par modèle, pour que la galerie ne donne
// pas l'impression que tous les modèles se ressemblent. Choisies pour rester
// lisibles sur fond blanc et cohérentes avec le style de chaque modèle.
const PREVIEW_COLORS: Record<string, string> = {
  "template-01": "#1e3a5f", // Classique Élégant — bleu marine sobre
  "template-02": "#2563eb", // Moderne Bicolore — bleu vif
  "template-03": "#334155", // Minimaliste — gris ardoise
  "template-04": "#0f766e", // Corporate — vert émeraude foncé
  "template-05": "#e11d48", // Créatif Accent — rose vif
  "template-06": "#7c3aed", // Ingénieur Tech — violet
  "template-07": "#78350f", // Exécutif Premium — brun doré
  "template-08": "#0e7490", // Compact Data — cyan foncé
  "template-09": "#4b5563", // Académique — gris neutre
  "template-10": "#0284c7", // Sidebar Clair — bleu ciel
  "template-11": "#059669", // Épuré Grille — vert
  "template-12": "#1d4ed8", // International — bleu classique
  "template-13": "#ea580c", // Startup Dynamique — orange
  "template-14": "#4338ca", // Consultant — indigo
  "template-15": "#a21caf", // Photo Focus — fuchsia
};

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
              <TemplateThumbnail cv={demoCV(tpl.id, PREVIEW_COLORS[tpl.id])} />
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
