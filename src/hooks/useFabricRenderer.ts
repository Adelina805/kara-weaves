"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  RENDER_DEBOUNCE_MS,
  RENDER_DEFAULTS,
  renderFabric,
  type FabricDesign,
} from "@/lib/fabric";

export function useFabricRenderer(design: FabricDesign, immediate = false) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderNow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    renderFabric(canvas, design, RENDER_DEFAULTS);
  }, [design]);

  useEffect(() => {
    if (immediate) {
      renderNow();
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(renderNow, RENDER_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [design, immediate, renderNow]);

  return { canvasRef, renderNow };
}
