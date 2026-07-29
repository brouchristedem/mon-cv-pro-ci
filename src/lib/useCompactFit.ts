"use client";

import { useEffect, useRef, useState } from "react";

// 297mm à 96dpi (référentiel déjà utilisé par useFitScale pour la largeur 210mm/794px)
const PAGE_HEIGHT_PX = 1122.5;
// On ne descend pas en dessous de cette échelle pour garder un CV lisible :
// au-delà, mieux vaut que la personne retire du contenu plutôt que d'avoir
// un texte illisible une fois imprimé.
const MIN_COMPACT_SCALE = 0.55;

/**
 * Quand `enabled` est vrai, mesure la hauteur réelle du contenu rendu dans
 * `measureRef` (à l'échelle `baseZoom`) et calcule le facteur supplémentaire
 * à appliquer pour que le CV tienne sur une seule page A4. Se recalcule à
 * chaque changement de contenu (via `watch`).
 */
export function useCompactFit(enabled: boolean, baseZoom: number, watch: string) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [compactScale, setCompactScale] = useState(1);

  useEffect(() => {
    if (!enabled) {
      setCompactScale(1);
      return;
    }
    const id = requestAnimationFrame(() => {
      const el = measureRef.current;
      if (!el) return;
      const naturalHeight = el.scrollHeight;
      if (naturalHeight > PAGE_HEIGHT_PX) {
        const factor = PAGE_HEIGHT_PX / naturalHeight;
        setCompactScale(Math.max(MIN_COMPACT_SCALE, factor));
      } else {
        setCompactScale(1);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [enabled, baseZoom, watch]);

  return { measureRef, compactScale };
}
