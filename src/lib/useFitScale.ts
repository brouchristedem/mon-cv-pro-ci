"use client";

import { useEffect, useRef, useState } from "react";

const CONTENT_WIDTH_PX = 794; // équivalent de 210mm à 96dpi

export function useFitScale(zoomMultiplier: number = 1) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setBaseScale(Math.min(1, width / CONTENT_WIDTH_PX));
      }
    };

    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, scale: baseScale * zoomMultiplier, contentWidth: CONTENT_WIDTH_PX };
}
