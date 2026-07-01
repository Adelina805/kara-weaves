import { adjustColor, clamp, mix, rgbToString } from "../color";
import type { RGB } from "../types";
import { addFiberNoise } from "./fiber-noise";

export function createPlainWeavePattern(
  ctx: CanvasRenderingContext2D,
  warpColor: RGB,
  weftColor: RGB,
  warpThickness: number,
  weftThickness: number,
  textureAmount: number,
): CanvasPattern | null {
  const cellWidth = Math.max(2, warpThickness);
  const cellHeight = Math.max(2, weftThickness);

  const repeatCols = 18;
  const repeatRows = 18;

  const tileWidth = cellWidth * repeatCols;
  const tileHeight = cellHeight * repeatRows;

  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const tileCtx = tile.getContext("2d");
  if (!tileCtx) {
    return null;
  }

  tileCtx.fillStyle = rgbToString(mix(warpColor, weftColor, 0.5));
  tileCtx.fillRect(0, 0, tileWidth, tileHeight);

  const colVariation: number[] = [];
  const rowVariation: number[] = [];

  for (let i = 0; i < repeatCols; i++) {
    colVariation.push((Math.random() - 0.5) * 18 * textureAmount);
  }

  for (let i = 0; i < repeatRows; i++) {
    rowVariation.push((Math.random() - 0.5) * 18 * textureAmount);
  }

  for (let row = 0; row < repeatRows; row++) {
    for (let col = 0; col < repeatCols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;

      const warpOnTop = (row + col) % 2 === 0;

      const base = warpOnTop ? warpColor : weftColor;
      const under = warpOnTop ? weftColor : warpColor;

      let woven = mix(base, under, 0.86);

      const variation = warpOnTop ? colVariation[col] : rowVariation[row];
      woven = adjustColor(woven, variation);

      woven = {
        r: clamp(woven.r + (Math.random() - 0.5) * 4 * textureAmount),
        g: clamp(woven.g + (Math.random() - 0.5) * 3 * textureAmount),
        b: clamp(woven.b + (Math.random() - 0.5) * 4 * textureAmount),
      };

      tileCtx.fillStyle = rgbToString(woven);
      tileCtx.fillRect(x, y, cellWidth, cellHeight);

      tileCtx.globalAlpha = 0.1 + textureAmount * 0.1;
      tileCtx.fillStyle = "white";

      if (warpOnTop) {
        tileCtx.fillRect(x + Math.floor(cellWidth * 0.35), y, 1, cellHeight);
      } else {
        tileCtx.fillRect(x, y + Math.floor(cellHeight * 0.35), cellWidth, 1);
      }

      tileCtx.globalAlpha = 0.08 + textureAmount * 0.1;
      tileCtx.fillStyle = "black";

      if (warpOnTop) {
        tileCtx.fillRect(x + cellWidth - 1, y, 1, cellHeight);
      } else {
        tileCtx.fillRect(x, y + cellHeight - 1, cellWidth, 1);
      }

      tileCtx.globalAlpha = 1;
    }
  }

  tileCtx.globalAlpha = 0.06 + textureAmount * 0.09;
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

  addFiberNoise(tileCtx, tileWidth, tileHeight, cellWidth, cellHeight, textureAmount);

  tileCtx.globalAlpha = 1;

  return ctx.createPattern(tile, "repeat");
}
