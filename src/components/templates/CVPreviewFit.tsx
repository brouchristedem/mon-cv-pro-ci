"use client";

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

      {/* Zone dédiée à l'impression uniquement — totalement indépendante de
          l'aperçu écran, pour éviter tout conflit d'échelle. */}
      {printMode && (
        <div className="hidden print:block">
          <div
            id="cv-print-area"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              zoom: cv.tailleTexte / 13,
            }}
          >
            <CVRenderer cv={cv} />
          </div>
        </div>
      )}
    </>
  );
}
