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
          {/* Boîte de page fixe 210x297mm : sa taille ne doit jamais dépendre
              du réglage "taille du texte", sinon la page imprimée se
              rétrécit/agrandit avec lui et laisse un vide en bas (ou déborde
              sur une 2e page presque blanche). */}
          <div
            id="cv-print-area"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            {/* Le contenu, lui, est mis à l'échelle via transform (qui ne
                change pas la taille de la boîte parente), puis compensé en
                largeur/hauteur pour continuer à remplir exactement 210x297mm
                après mise à l'échelle. */}
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
        </div>
      )}
    </>
  );
}
