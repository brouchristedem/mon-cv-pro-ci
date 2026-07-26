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
          imprimées : 1 page par défaut, plus si le contenu déborde.

          C'est l'impression native du navigateur (window.print()) qui sert
          désormais de méthode de téléchargement, sur tous les navigateurs :
          une tentative précédente générait le PDF côté client (html2canvas)
          en recréant sa propre mise en page en JavaScript plutôt que
          d'utiliser le moteur du navigateur, ce qui produisait de petits
          écarts invisibles à l'écran mais visibles une fois téléchargé
          (icônes légèrement décalées, texte dupliqué de quelques pixels sur
          une coupure de page). L'impression native utilise le même moteur de
          rendu que l'aperçu à l'écran : ce qui est correct à l'écran l'est
          donc aussi une fois téléchargé. */}
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
                  height: `${297 / (cv.tailleTexte / 13)}mm`,
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
