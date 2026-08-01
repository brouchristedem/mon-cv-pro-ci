"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CVData } from "@/lib/types";
import CVRenderer from "./CVRenderer";
import { useFitScale } from "@/lib/useFitScale";
import { useCompactFit } from "@/lib/useCompactFit";

const PAGE_HEIGHT_RATIO = 297 / 210;

export default function CVPreviewFit({
  cv,
  printMode = false,
  zoom = 1,
}: {
  cv: CVData;
  printMode?: boolean;
  zoom?: number;
}) {
  const { containerRef, scale, contentWidth } = useFitScale(zoom);
  const scaledHeight = contentWidth * PAGE_HEIGHT_RATIO * scale;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const baseZoom = cv.tailleTexte / 13;
  // Une clé simple qui change dès que quelque chose susceptible d'affecter la
  // hauteur du CV change, pour redéclencher la mesure du mode compact (sans
  // dépendre d'une sérialisation complète et coûteuse de tout l'objet cv à
  // chaque frappe). Doit couvrir tout ce qui influe visuellement sur la
  // hauteur : infos personnelles (en-tête), mode d'affichage des rubriques
  // (ligne vs liste change radicalement la hauteur), et chaque champ texte
  // d'un item, pas seulement titre/description.
  const p = cv.personalInfo;
  const personalKey = `${p.showPhoto ? p.photoShape : "x"}|${p.prenom.length}|${p.nom.length}|${p.titre.length}|${p.email.length}|${p.telephone.length}|${p.adresse.length}|${(p.permis || "").length}|${(p.linkedin || "").length}|${(p.siteWeb || "").length}|${p.autresInfos.map((i) => i.label.length + i.valeur.length).join(",")}`;
  const watchKey = `${cv.templateId}|${cv.tailleTexte}|${cv.dateFormat}|${cv.iconStyle}|${cv.ordreNom}|${personalKey}|${cv.sections
    .map(
      (s) =>
        `${s.id}:${s.visible}:${s.affichage || ""}:${s.items.length}:${s.items
          .map(
            (i) =>
              (i.titre || "").length +
              (i.sousTitre || "").length +
              (i.lieu || "").length +
              (i.dateDebut || "").length +
              (i.dateFin || "").length +
              (i.niveau || "").length +
              (i.description || "").length
          )
          .join(",")}`
    )
    .join("|")}`;
  const { measureRef, compactScale } = useCompactFit(!!cv.modeCompact, baseZoom, watchKey);
  const finalZoom = baseZoom * compactScale;

  return (
    <>
      {/* Aperçu visible à l'écran uniquement — ajusté à la largeur disponible */}
      <div
        ref={containerRef}
        className="w-full print:hidden"
        style={{ height: scaledHeight || undefined }}
      >
        <div
          className="bg-white shadow-xl cv-protected mx-auto"
          style={{
            width: contentWidth,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div style={{ zoom: finalZoom }}>
            <CVRenderer cv={cv} />
          </div>
        </div>
      </div>

      {/* Mesure invisible hors-écran, rendue à l'échelle actuellement
          candidate (finalZoom), pour savoir si le contenu déborde d'une page
          à cette taille et affiner le facteur de réduction sur plusieurs
          passes si besoin — voir useCompactFit. */}
      {cv.modeCompact && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            top: 0,
            left: -99999,
            width: 794,
            pointerEvents: "none",
          }}
        >
          <div ref={measureRef} style={{ zoom: finalZoom }}>
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
              <div style={{ zoom: finalZoom }}>
                <CVRenderer cv={cv} />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
