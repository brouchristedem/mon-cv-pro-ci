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

      {/* Zone dédiée à la génération du PDF (html2canvas + jsPDF). Rendue
          hors-écran (pas en display:none, sinon html2canvas ne peut rien
          capturer) à une largeur fixe correspondant à une page A4, avec le
          même réglage de taille de texte que l'aperçu. Cette méthode ne
          dépend plus de window.print()/la boîte de dialogue d'impression du
          navigateur, qui s'est révélée peu fiable sur certains mobiles
          (notamment iPhone/Safari) : un vrai fichier PDF est généré et
          téléchargé directement. */}
      {printMode && mounted && (
        <div
          id="cv-capture-area"
          style={{
            position: "fixed",
            top: 0,
            left: "-10000px",
            width: "794px",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              width: `${100 / (cv.tailleTexte / 13)}%`,
              transform: `scale(${cv.tailleTexte / 13})`,
              transformOrigin: "top left",
            }}
          >
            <CVRenderer cv={cv} />
          </div>
        </div>
      )}

      {/* Zone dédiée à l'impression : rendue via un portail directement dans
          <body>, en dehors de l'arborescence de l'application. Le reste de
          l'app (masqué en CSS via visibility) occupait quand même sa place
          dans la page, ce qui forçait Chrome à créer des pages en trop même
          quand le CV visible tenait sur une seule page. En sortant du DOM de
          l'app, seule la vraie hauteur du CV détermine le nombre de pages
          imprimées : 1 page par défaut, plus si le contenu déborde.
          (Conservée en repli pour "Imprimer" depuis le menu du navigateur ;
          le bouton "Télécharger" utilise désormais la génération PDF
          directe ci-dessus.) */}
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
