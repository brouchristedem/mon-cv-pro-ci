"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CVData } from "@/lib/types";
import CVRenderer from "./CVRenderer";
import { useFitScale } from "@/lib/useFitScale";

const PAGE_HEIGHT_RATIO = 297 / 210;

export default function CVPreviewFit({
  cv,
  printMode = false,
}: {
  cv: CVData;
  printMode?: boolean;
}) {
  const { containerRef, scale, contentWidth } = useFitScale();
  const scaledHeight = contentWidth * PAGE_HEIGHT_RATIO * scale;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Aperçu visible à l'écran uniquement — ajusté à la largeur disponible */}
      <div
        ref={containerRef}
        className="w-full print:hidden"
        style={{ height: scaledHeight || undefined }}
      >
        <div
          className="bg-white shadow-xl cv-protected"
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div style={{ zoom: cv.tailleTexte / 13 }}>
            <CVRenderer cv={cv} />
          </div>
        </div>
      </div>

      {/* Zone dédiée à l'impression : rendue via un portail directement dans
          <body>, en dehors de l'arborescence de l'application. Le reste de
          l'app (masqué en CSS via visibility) occupait quand même sa place
          dans la page, ce qui forçait Chrome à créer des pages en trop même
          quand le CV visible tenait sur une seule page. En sortant du DOM de
          l'app, seule la vraie hauteur du CV détermine le nombre de pages
          imprimées : 1 page par défaut, plus si le contenu déborde. */}
      {printMode &&
        mounted &&
        createPortal(
          <div id="cv-print-portal">
            <div
              id="cv-print-area"
              style={{
                width: "210mm",
                minHeight: "297mm",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width: `${100 / (cv.tailleTexte / 13)}%`,
                  minHeight: `${297 / (cv.tailleTexte / 13)}mm`,
                  transform: `scale(${cv.tailleTexte / 13})`,
                  transformOrigin: "top left",
                }}
              >
                <CVRenderer cv={cv} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
