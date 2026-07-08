import { adjustColor, clamp, mix, rgbToString } from "../color";
import type { RGB } from "../types";
import { addFiberNoise } from "./fiber-noise";

function warmSlubTone(color: RGB, amount: number): RGB {
  return {
    r: clamp(color.r + amount * 8),
    g: clamp(color.g + amount * 4),
    b: clamp(color.b - amount * 6),
  };
}

export function createThorthuCottonPattern(
  ctx: CanvasRenderingContext2D,
  warpColor: RGB,
  weftColor: RGB,
  warpThickness: number,
  weftThickness: number,
  textureAmount: number,
): CanvasPattern | null {
  const baseCellWidth = Math.max(2, warpThickness);
  const baseCellHeight = Math.max(2, weftThickness);

  const repeatCols = 20;
  const repeatRows = 20;

  const colWidths: number[] = [];
  const rowHeights: number[] = [];

  for (let i = 0; i < repeatCols; i++) {
    const variation = 1 + (Math.random() - 0.5) * 0.6 * textureAmount;
    colWidths.push(Math.max(1, Math.round(baseCellWidth * variation)));
  }

  for (let i = 0; i < repeatRows; i++) {
    const variation = 1 + (Math.random() - 0.5) * 0.6 * textureAmount;
    rowHeights.push(Math.max(1, Math.round(baseCellHeight * variation)));
  }

  const tileWidth = colWidths.reduce((sum, width) => sum + width, 0);
  const tileHeight = rowHeights.reduce((sum, height) => sum + height, 0);

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
    colVariation.push((Math.random() - 0.5) * 24 * textureAmount);
  }

  for (let i = 0; i < repeatRows; i++) {
    rowVariation.push((Math.random() - 0.5) * 24 * textureAmount);
  }

  let y = 0;
  for (let row = 0; row < repeatRows; row++) {
    const cellHeight = rowHeights[row];
    let x = 0;

    for (let col = 0; col < repeatCols; col++) {
      const cellWidth = colWidths[col];
      const warpOnTop = (row + col) % 2 === 0;
      const skipThread = Math.random() < 0.04 * textureAmount;

      if (!skipThread) {
        const base = warpOnTop ? warpColor : weftColor;
        const under = warpOnTop ? weftColor : warpColor;

        let woven = mix(base, under, 0.84);
        const variation = warpOnTop ? colVariation[col] : rowVariation[row];
        woven = adjustColor(woven, variation);

        if (Math.random() < 0.12 * textureAmount) {
          woven = warmSlubTone(woven, 0.5 + Math.random() * 0.5);
        }

        woven = {
          r: clamp(woven.r + (Math.random() - 0.5) * 6 * textureAmount),
          g: clamp(woven.g + (Math.random() - 0.5) * 5 * textureAmount),
          b: clamp(woven.b + (Math.random() - 0.5) * 6 * textureAmount),
        };

        tileCtx.fillStyle = rgbToString(woven);
        tileCtx.fillRect(x, y, cellWidth, cellHeight);

        if (Math.random() < 0.35 * textureAmount) {
          tileCtx.globalAlpha = 0.12 + textureAmount * 0.08;
          tileCtx.fillStyle = warpOnTop ? "white" : "rgba(255,248,235,0.7)";
          if (warpOnTop) {
            tileCtx.fillRect(x + Math.floor(cellWidth * 0.3), y, 1, cellHeight);
          } else {
            tileCtx.fillRect(x, y + Math.floor(cellHeight * 0.3), cellWidth, 1);
          }
          tileCtx.globalAlpha = 1;
        }
      }

      x += cellWidth;
    }

    y += cellHeight;
  }

  addFiberNoise(tileCtx, tileWidth, tileHeight, baseCellWidth, baseCellHeight, textureAmount * 1.35);

  tileCtx.globalAlpha = 0.05 + textureAmount * 0.06;
  tileCtx.strokeStyle = "rgba(90, 70, 45, 0.35)";
  tileCtx.lineWidth = 1;

  let gridX = 0;
  for (const width of colWidths) {
    tileCtx.beginPath();
    tileCtx.moveTo(gridX + 0.5, 0);
    tileCtx.lineTo(gridX + 0.5, tileHeight);
    tileCtx.stroke();
    gridX += width;
  }

  let gridY = 0;
  for (const height of rowHeights) {
    tileCtx.beginPath();
    tileCtx.moveTo(0, gridY + 0.5);
    tileCtx.lineTo(tileWidth, gridY + 0.5);
    tileCtx.stroke();
    gridY += height;
  }

  tileCtx.globalAlpha = 1;

  return ctx.createPattern(tile, "repeat");
}
