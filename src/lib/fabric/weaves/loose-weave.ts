import { adjustColor, darken, lighten, mix, rgbToString } from "../color";
import type { LooseWeaveParams, RGB } from "../types";

export function createLooseWeavePattern(
  ctx: CanvasRenderingContext2D,
  warpColor: RGB,
  weftColor: RGB,
  warpThickness: number,
  weftThickness: number,
  textureAmount: number,
  loose: LooseWeaveParams,
): CanvasPattern | null {
  const cellWidth = Math.max(1, warpThickness);
  const cellHeight = Math.max(1, weftThickness);

  const openness = loose.openness / 100;
  const looseIrregularity = loose.irregularity / 100;
  const looseThreadOpacity = loose.threadOpacity / 100;

  const spacingX = Math.max(8, cellWidth * (3.5 + openness * 9.5));
  const spacingY = Math.max(8, cellHeight * (3.5 + openness * 9.5));

  const threadW = Math.max(1.1, cellWidth * (0.65 - openness * 0.28));
  const threadH = Math.max(1.1, cellHeight * (0.65 - openness * 0.28));

  const repeatCols = 24;
  const repeatRows = 24;

  const tileWidth = Math.ceil(spacingX * repeatCols);
  const tileHeight = Math.ceil(spacingY * repeatRows);

  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const maybeCtx = tile.getContext("2d");
  if (maybeCtx === null) {
    return null;
  }
  const tctx: CanvasRenderingContext2D = maybeCtx;

  const baseColor = lighten(mix(warpColor, weftColor, 0.5), 0.3);
  const gapColor = lighten(baseColor, 0.08);
  const gapShadow = darken(baseColor, 0.15);

  const warpMain = lighten(warpColor, 0.04);
  const weftMain = lighten(weftColor, 0.04);

  const warpShadow = darken(warpColor, 0.25);
  const weftShadow = darken(weftColor, 0.25);

  const warpHighlight = lighten(warpColor, 0.35);
  const weftHighlight = lighten(weftColor, 0.35);

  tctx.fillStyle = rgbToString(gapColor);
  tctx.fillRect(0, 0, tileWidth, tileHeight);

  tctx.globalAlpha = 0.07 + textureAmount * 0.06;
  tctx.fillStyle = rgbToString(gapShadow);

  for (let y = 0; y < tileHeight; y += spacingY) {
    for (let x = 0; x < tileWidth; x += spacingX) {
      const jitterX = (Math.random() - 0.5) * spacingX * looseIrregularity * 0.35;
      const jitterY = (Math.random() - 0.5) * spacingY * looseIrregularity * 0.35;

      tctx.fillRect(
        x + threadW * 1.4 + jitterX,
        y + threadH * 1.4 + jitterY,
        Math.max(1, spacingX - threadW * 3),
        Math.max(1, spacingY - threadH * 3),
      );
    }
  }

  tctx.globalAlpha = 1;

  const warpXs: number[] = [];
  const weftYs: number[] = [];

  for (let i = -1; i <= repeatCols + 1; i++) {
    const jitter = (Math.random() - 0.5) * spacingX * looseIrregularity * 0.42;
    warpXs.push(i * spacingX + jitter);
  }

  for (let i = -1; i <= repeatRows + 1; i++) {
    const jitter = (Math.random() - 0.5) * spacingY * looseIrregularity * 0.42;
    weftYs.push(i * spacingY + jitter);
  }

  function drawVerticalThread(
    x: number,
    colorMain: RGB,
    colorShadow: RGB,
    colorHighlight: RGB,
    width: number,
    alpha: number,
  ): void {
    const wave = spacingX * looseIrregularity * 0.1;
    const segment = Math.max(18, spacingY * 1.6);

    function drawPath(offsetX: number, strokeColor: string, strokeWidth: number, opacity: number): void {
      tctx.globalAlpha = opacity;
      tctx.strokeStyle = strokeColor;
      tctx.lineWidth = strokeWidth;
      tctx.lineCap = "round";
      tctx.beginPath();
      tctx.moveTo(x + offsetX + (Math.random() - 0.5) * wave, -10);

      for (let y = 0; y <= tileHeight + segment; y += segment) {
        const cx = x + offsetX + (Math.random() - 0.5) * wave;
        const cy = y + segment * 0.5;
        const ex = x + offsetX + (Math.random() - 0.5) * wave;
        const ey = y + segment;

        tctx.quadraticCurveTo(cx, cy, ex, ey);
      }

      tctx.stroke();
    }

    drawPath(0.8, rgbToString(colorShadow), width * 1.55, alpha * 0.34);
    drawPath(0, rgbToString(colorMain), width, alpha);
    drawPath(-width * 0.18, rgbToString(colorHighlight), Math.max(0.55, width * 0.28), alpha * 0.42);
    tctx.globalAlpha = 1;
  }

  function drawHorizontalThread(
    y: number,
    colorMain: RGB,
    colorShadow: RGB,
    colorHighlight: RGB,
    width: number,
    alpha: number,
  ): void {
    const wave = spacingY * looseIrregularity * 0.1;
    const segment = Math.max(18, spacingX * 1.6);

    function drawPath(offsetY: number, strokeColor: string, strokeWidth: number, opacity: number): void {
      tctx.globalAlpha = opacity;
      tctx.strokeStyle = strokeColor;
      tctx.lineWidth = strokeWidth;
      tctx.lineCap = "round";
      tctx.beginPath();
      tctx.moveTo(-10, y + offsetY + (Math.random() - 0.5) * wave);

      for (let x = 0; x <= tileWidth + segment; x += segment) {
        const cx = x + segment * 0.5;
        const cy = y + offsetY + (Math.random() - 0.5) * wave;
        const ex = x + segment;
        const ey = y + offsetY + (Math.random() - 0.5) * wave;

        tctx.quadraticCurveTo(cx, cy, ex, ey);
      }

      tctx.stroke();
    }

    drawPath(0.8, rgbToString(colorShadow), width * 1.55, alpha * 0.34);
    drawPath(0, rgbToString(colorMain), width, alpha);
    drawPath(-width * 0.18, rgbToString(colorHighlight), Math.max(0.55, width * 0.28), alpha * 0.42);
    tctx.globalAlpha = 1;
  }

  for (let i = 0; i < warpXs.length; i++) {
    const alpha = looseThreadOpacity * (0.55 + Math.random() * 0.28);
    drawVerticalThread(
      warpXs[i],
      adjustColor(warpMain, (Math.random() - 0.5) * 18 * textureAmount),
      warpShadow,
      warpHighlight,
      threadW,
      alpha,
    );
  }

  for (let j = 0; j < weftYs.length; j++) {
    const alpha = looseThreadOpacity * (0.55 + Math.random() * 0.28);
    drawHorizontalThread(
      weftYs[j],
      adjustColor(weftMain, (Math.random() - 0.5) * 18 * textureAmount),
      weftShadow,
      weftHighlight,
      threadH,
      alpha,
    );
  }

  for (let i = 0; i < warpXs.length; i++) {
    for (let j = 0; j < weftYs.length; j++) {
      const x = warpXs[i];
      const y = weftYs[j];
      const warpOnTop = (i + j) % 2 === 0;

      if (warpOnTop) {
        tctx.globalAlpha = looseThreadOpacity * 0.8;
        tctx.strokeStyle = rgbToString(lighten(warpMain, 0.12));
        tctx.lineWidth = threadW * 1.08;
        tctx.lineCap = "round";
        tctx.beginPath();
        tctx.moveTo(x, y - spacingY * 0.28);
        tctx.lineTo(x + (Math.random() - 0.5) * 1.5, y + spacingY * 0.28);
        tctx.stroke();
      } else {
        tctx.globalAlpha = looseThreadOpacity * 0.8;
        tctx.strokeStyle = rgbToString(lighten(weftMain, 0.12));
        tctx.lineWidth = threadH * 1.08;
        tctx.lineCap = "round";
        tctx.beginPath();
        tctx.moveTo(x - spacingX * 0.28, y);
        tctx.lineTo(x + spacingX * 0.28, y + (Math.random() - 0.5) * 1.5);
        tctx.stroke();
      }
    }
  }

  tctx.globalAlpha = 0.08 + openness * 0.1;
  tctx.fillStyle = "rgba(255,255,255,0.85)";

  for (let y = 0; y < tileHeight; y += spacingY) {
    for (let x = 0; x < tileWidth; x += spacingX) {
      tctx.fillRect(
        x + threadW * 1.8,
        y + threadH * 1.8,
        Math.max(1, spacingX - threadW * 4),
        Math.max(1, spacingY - threadH * 4),
      );
    }
  }

  const strayCount = Math.floor(80 + textureAmount * 220);

  for (let i = 0; i < strayCount; i++) {
    const horizontal = Math.random() > 0.48;
    const fx = Math.random() * tileWidth;
    const fy = Math.random() * tileHeight;
    const len = 6 + Math.random() * Math.max(spacingX, spacingY) * 2.2;

    tctx.globalAlpha = Math.random() * (0.08 + textureAmount * 0.13);
    tctx.strokeStyle =
      Math.random() > 0.22 ? "rgba(255,255,255,0.95)" : "rgba(120,112,96,0.50)";
    tctx.lineWidth = Math.random() > 0.9 ? 2 : 1;
    tctx.lineCap = "round";
    tctx.beginPath();

    if (horizontal) {
      tctx.moveTo(fx, fy);
      tctx.lineTo(fx + len, fy + (Math.random() - 0.5) * 4);
    } else {
      tctx.moveTo(fx, fy);
      tctx.lineTo(fx + (Math.random() - 0.5) * 4, fy + len);
    }

    tctx.stroke();
  }

  tctx.globalAlpha = 1;

  return ctx.createPattern(tile, "repeat");
}
