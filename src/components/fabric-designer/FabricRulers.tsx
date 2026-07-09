"use client";

import { useEffect, useRef, type ReactNode } from "react";
import {
  drawHorizontalRuler,
  drawRulerCorner,
  drawVerticalRuler,
  type RulerUnit,
} from "@/lib/fabric";

export const RULER_CHROME_SIZE = 28;
export const RULER_GAP = 4;

type FabricRulersProps = {
  enabled: boolean;
  displayWidth: number;
  displayHeight: number;
  pixelsPerInch: number;
  fitScale: number;
  zoom: number;
  unit?: RulerUnit;
  children: ReactNode;
};

function setupCanvas(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return null;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

export function FabricRulers({
  enabled,
  displayWidth,
  displayHeight,
  pixelsPerInch,
  fitScale,
  zoom,
  unit = "imperial",
  children,
}: FabricRulersProps) {
  const cornerRef = useRef<HTMLCanvasElement>(null);
  const topRef = useRef<HTMLCanvasElement>(null);
  const leftRef = useRef<HTMLCanvasElement>(null);

  const displayPixelsPerUnit = pixelsPerInch * fitScale * zoom;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cornerCanvas = cornerRef.current;
    const topCanvas = topRef.current;
    const leftCanvas = leftRef.current;

    if (!cornerCanvas || !topCanvas || !leftCanvas) {
      return;
    }

    const cornerCtx = setupCanvas(cornerCanvas, RULER_CHROME_SIZE, RULER_CHROME_SIZE);
    const topCtx = setupCanvas(topCanvas, displayWidth, RULER_CHROME_SIZE);
    const leftCtx = setupCanvas(leftCanvas, RULER_CHROME_SIZE, displayHeight);

    if (!cornerCtx || !topCtx || !leftCtx) {
      return;
    }

    drawRulerCorner(cornerCtx, RULER_CHROME_SIZE, unit);
    drawHorizontalRuler(topCtx, displayWidth, RULER_CHROME_SIZE, displayPixelsPerUnit, unit);
    drawVerticalRuler(leftCtx, displayHeight, RULER_CHROME_SIZE, displayPixelsPerUnit, unit);
  }, [displayHeight, displayPixelsPerUnit, displayWidth, enabled, unit]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="inline-flex flex-col">
      <div className="flex" style={{ marginBottom: RULER_GAP }}>
        <canvas
          ref={cornerRef}
          className="shrink-0"
          style={{ width: RULER_CHROME_SIZE, height: RULER_CHROME_SIZE }}
          aria-hidden
        />
        <div className="shrink-0" style={{ width: RULER_GAP }} />
        <canvas
          ref={topRef}
          className="shrink-0"
          style={{ width: displayWidth, height: RULER_CHROME_SIZE }}
          aria-hidden
        />
      </div>
      <div className="flex">
        <canvas
          ref={leftRef}
          className="shrink-0"
          style={{ width: RULER_CHROME_SIZE, height: displayHeight }}
          aria-hidden
        />
        <div className="shrink-0" style={{ width: RULER_GAP }} />
        {children}
      </div>
    </div>
  );
}
