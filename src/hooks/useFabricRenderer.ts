"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import {
  RENDER_DEBOUNCE_MS,
  RENDER_DEFAULTS,
  renderFabric,
  type FabricDesign,
} from "@/lib/fabric";

export function useFabricRenderer(
  design: FabricDesign,
  immediate = false,
  externalCanvasRef?: RefObject<HTMLCanvasElement | null>,
) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef ?? internalCanvasRef;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const renderNow = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    renderFabric(canvas, design, RENDER_DEFAULTS);
  }, [canvasRef, design]);

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
