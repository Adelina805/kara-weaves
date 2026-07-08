import { adjustColor, clamp, darken, lighten, mix, rgbToString } from "../color";
import type { RGB } from "../types";
import { addFiberNoise } from "./fiber-noise";

const MOTIF_INTERVAL = 6;

function drawRaisedMotif(
  tileCtx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  baseColor: RGB,
  depth: number,
): void {
  const motifW = cellWidth * 4;
  const motifH = cellHeight * 4;
  const inset = Math.max(1, Math.floor(Math.min(cellWidth, cellHeight) * 0.35));

  const raised = lighten(baseColor, 0.08 + depth * 0.12);
  const highlight = lighten(baseColor, 0.18 + depth * 0.16);
  const shadow = darken(baseColor, 0.14 + depth * 0.18);

  tileCtx.fillStyle = rgbToString(raised);
  tileCtx.fillRect(x + inset, y + inset, motifW - inset * 2, motifH - inset * 2);

  tileCtx.fillStyle = rgbToString(highlight);
  tileCtx.fillRect(x + inset, y + inset, motifW - inset * 2, Math.max(1, Math.floor(motifH * 0.12)));
  tileCtx.fillRect(x + inset, y + inset, Math.max(1, Math.floor(motifW * 0.12)), motifH - inset * 2);

  tileCtx.fillStyle = rgbToString(shadow);
  tileCtx.fillRect(
    x + inset,
    y + motifH - inset - Math.max(1, Math.floor(motifH * 0.12)),
    motifW - inset * 2,
    Math.max(1, Math.floor(motifH * 0.12)),
  );
  tileCtx.fillRect(
    x + motifW - inset - Math.max(1, Math.floor(motifW * 0.12)),
    y + inset,
    Math.max(1, Math.floor(motifW * 0.12)),
    motifH - inset * 2,
  );

  const centerX = x + motifW / 2;
  const centerY = y + motifH / 2;
  const diamondSize = Math.min(motifW, motifH) * 0.22;

  tileCtx.fillStyle = rgbToString(lighten(baseColor, 0.22 + depth * 0.1));
  tileCtx.beginPath();
  tileCtx.moveTo(centerX, centerY - diamondSize);
  tileCtx.lineTo(centerX + diamondSize, centerY);
  tileCtx.lineTo(centerX, centerY + diamondSize);
  tileCtx.lineTo(centerX - diamondSize, centerY);
  tileCtx.closePath();
  tileCtx.fill();
}

export function createDobbTexturePattern(
  ctx: CanvasRenderingContext2D,
  warpColor: RGB,
  weftColor: RGB,
  warpThickness: number,
  weftThickness: number,
  textureAmount: number,
): CanvasPattern | null {
  const cellWidth = Math.max(2, warpThickness);
  const cellHeight = Math.max(2, weftThickness);

  const repeatCols = MOTIF_INTERVAL * 3;
  const repeatRows = MOTIF_INTERVAL * 3;

  const tileWidth = cellWidth * repeatCols;
  const tileHeight = cellHeight * repeatRows;

  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const tileCtx = tile.getContext("2d");
  if (!tileCtx) {
    return null;
  }

  const baseColor = mix(warpColor, weftColor, 0.5);

  tileCtx.fillStyle = rgbToString(baseColor);
  tileCtx.fillRect(0, 0, tileWidth, tileHeight);

  const colVariation: number[] = [];
  const rowVariation: number[] = [];

  for (let i = 0; i < repeatCols; i++) {
    colVariation.push((Math.random() - 0.5) * 14 * textureAmount);
  }

  for (let i = 0; i < repeatRows; i++) {
    rowVariation.push((Math.random() - 0.5) * 14 * textureAmount);
  }

  for (let row = 0; row < repeatRows; row++) {
    for (let col = 0; col < repeatCols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      const warpOnTop = (row + col) % 2 === 0;
      const base = warpOnTop ? warpColor : weftColor;
      const under = warpOnTop ? weftColor : warpColor;

      let woven = mix(base, under, 0.88);
      const variation = warpOnTop ? colVariation[col] : rowVariation[row];
      woven = adjustColor(woven, variation);

      woven = {
        r: clamp(woven.r + (Math.random() - 0.5) * 3 * textureAmount),
        g: clamp(woven.g + (Math.random() - 0.5) * 3 * textureAmount),
        b: clamp(woven.b + (Math.random() - 0.5) * 3 * textureAmount),
      };

      tileCtx.fillStyle = rgbToString(woven);
      tileCtx.fillRect(x, y, cellWidth, cellHeight);
    }
  }

  for (let row = 0; row < repeatRows; row += MOTIF_INTERVAL) {
    for (let col = 0; col < repeatCols; col += MOTIF_INTERVAL) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      drawRaisedMotif(tileCtx, x, y, cellWidth, cellHeight, baseColor, textureAmount);
    }
  }

  tileCtx.globalAlpha = 0.05 + textureAmount * 0.07;
  tileCtx.strokeStyle = "black";
  tileCtx.lineWidth = 1;

  for (let x = 0; x <= tileWidth; x += cellWidth) {
    tileCtx.beginPath();
    tileCtx.moveTo(x + 0.5, 0);
    tileCtx.lineTo(x + 0.5, tileHeight);
    tileCtx.stroke();
  }

  for (let y = 0; y <= tileHeight; y += cellHeight) {
    tileCtx.beginPath();
    tileCtx.moveTo(0, y + 0.5);
    tileCtx.lineTo(tileWidth, y + 0.5);
    tileCtx.stroke();
  }

  addFiberNoise(tileCtx, tileWidth, tileHeight, cellWidth, cellHeight, textureAmount * 0.75);

  tileCtx.globalAlpha = 1;

  return ctx.createPattern(tile, "repeat");
}
