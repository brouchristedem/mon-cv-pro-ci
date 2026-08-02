"use client";

import { useEffect, useRef, useState } from "react";
import { CVData } from "@/lib/types";
import CVRenderer from "@/components/templates/CVRenderer";

const CONTENT_WIDTH_PX = 794; // équivalent de 210mm à 96dpi
// Hauteur maximale (après mise à l'échelle) qu'une vignette peut atteindre,
// pour éviter qu'un modèle avec beaucoup de contenu ne casse l'alignement de
// la galerie. Rarement atteinte car le CV de démo est volontairement court.
const MAX_SCALED_HEIGHT = 340;

/**
 * Vignette de modèle pour la landing page : contrairement à CVPreviewFit
 * (pensé pour l'éditeur/l'impression, qui simule toujours une page A4
 * entière — d'où la bande blanche sous un CV de démo court), ce composant
 * mesure la hauteur réelle du contenu rendu et ajuste le cadre en
 * conséquence. Le CV remplit ainsi tout le cadre, sans espace vide et sans
 * être coupé.
 */
export default function TemplateThumbnail({ cv }: { cv: CVData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    const measureEl = measureRef.current;
    if (!el || !measureEl) return;

    const compute = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / CONTENT_WIDTH_PX);
      setContentHeight(measureEl.offsetHeight);
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    observer.observe(measureEl);
    return () => observer.disconnect();
  }, [cv.templateId]);

  const scaledHeight = Math.min(contentHeight * scale, MAX_SCALED_HEIGHT) || undefined;

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={measureRef}
        className="bg-white cv-protected"
        style={{
          width: CONTENT_WIDTH_PX,
          transform: `scale(${scale || 1})`,
          transformOrigin: "top left",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <CVRenderer cv={cv} />
      </div>
    </div>
  );
}
