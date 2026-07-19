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
    <div ref={containerRef} className="w-full fit-outer" style={{ height: scaledHeight || undefined }}>
      <div
        className={`preview-fit-inner bg-white shadow-xl ${printMode ? "" : "cv-protected"}`}
        style={{
          width: contentWidth,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          id={printMode ? "cv-print-area" : undefined}
          className={printMode && cv.compresserUnePage ? "compresser" : undefined}
          style={printMode ? { zoom: cv.tailleTexte / 13 } : undefined}
        >
          <CVRenderer cv={cv} />
        </div>
      </div>
    </div>
  );
}
