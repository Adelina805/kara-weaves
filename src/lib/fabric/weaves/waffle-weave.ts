import { adjustColor, darken, lighten, mix, rgbToString } from "../color";
import { FIXED_WAFFLE_CELL_SCALE, FIXED_WAFFLE_DEPTH } from "../defaults";
import type { RGB } from "../types";

export function createWaffleWeavePattern(
  ctx: CanvasRenderingContext2D,
  warpColor: RGB,
  weftColor: RGB,
  warpThickness: number,
  weftThickness: number,
  textureAmount: number,
): CanvasPattern | null {
  const cellWidth = Math.max(2, warpThickness);
  const cellHeight = Math.max(2, weftThickness);

  const waffleDepth = FIXED_WAFFLE_DEPTH / 100;
  const waffleCellScale = FIXED_WAFFLE_CELL_SCALE;

  const unitW = Math.max(22, cellWidth * waffleCellScale);
  const unitH = Math.max(22, cellHeight * waffleCellScale);

  const repeatCols = 7;
  const repeatRows = 7;

  const tileWidth = unitW * repeatCols;
  const tileHeight = unitH * repeatRows;

  const ridgeW = Math.max(4, Math.floor(unitW * 0.24));
  const ridgeH = Math.max(4, Math.floor(unitH * 0.24));

  const tile = document.createElement("canvas");
  tile.width = tileWidth;
  tile.height = tileHeight;

  const tileCtx = tile.getContext("2d");
  if (!tileCtx) {
    return null;
  }

  const baseColor = mix(warpColor, weftColor, 0.5);
  const raisedLight = lighten(baseColor, 0.16 + waffleDepth * 0.2);
  const raisedMid = lighten(baseColor, 0.05 + waffleDepth * 0.08);
  const recessedMid = darken(baseColor, 0.06 + waffleDepth * 0.15);
  const recessedDark = darken(baseColor, 0.12 + waffleDepth * 0.22);
  const deepShadow = darken(baseColor, 0.2 + waffleDepth * 0.24);

  tileCtx.fillStyle = rgbToString(baseColor);
  tileCtx.fillRect(0, 0, tileWidth, tileHeight);

  for (let row = 0; row < repeatRows; row++) {
    for (let col = 0; col < repeatCols; col++) {
      const x = col * unitW;
      const y = row * unitH;

      const variation = (Math.random() - 0.5) * 14 * textureAmount;

      const localRaisedLight = adjustColor(raisedLight, variation);
      const localRaisedMid = adjustColor(raisedMid, variation * 0.65);
      const localRecessedMid = adjustColor(recessedMid, variation * 0.45);
      const localRecessedDark = adjustColor(recessedDark, variation * 0.35);
      const localDeepShadow = adjustColor(deepShadow, variation * 0.3);

      const centerX = x + ridgeW;
      const centerY = y + ridgeH;
      const centerW = unitW - ridgeW * 2;
      const centerH = unitH - ridgeH * 2;

      tileCtx.fillStyle = rgbToString(localRaisedMid);
      tileCtx.fillRect(x, y, unitW, unitH);

      const pocketGrad = tileCtx.createLinearGradient(
        centerX,
        centerY,
        centerX + centerW,
        centerY + centerH,
      );
      pocketGrad.addColorStop(0, rgbToString(localRecessedDark));
      pocketGrad.addColorStop(0.35, rgbToString(localRecessedMid));
      pocketGrad.addColorStop(0.7, rgbToString(darken(localRecessedMid, 0.06)));
      pocketGrad.addColorStop(1, rgbToString(localDeepShadow));

      tileCtx.fillStyle = pocketGrad;
      tileCtx.fillRect(centerX, centerY, centerW, centerH);

      const topGrad = tileCtx.createLinearGradient(x, y, x, y + ridgeH);
      topGrad.addColorStop(0, rgbToString(localRaisedLight));
      topGrad.addColorStop(0.45, rgbToString(localRaisedMid));
      topGrad.addColorStop(1, rgbToString(darken(localRaisedMid, 0.08)));

      tileCtx.fillStyle = topGrad;
      tileCtx.fillRect(x, y, unitW, ridgeH);

      const leftGrad = tileCtx.createLinearGradient(x, y, x + ridgeW, y);
      leftGrad.addColorStop(0, rgbToString(localRaisedLight));
      leftGrad.addColorStop(0.5, rgbToString(localRaisedMid));
      leftGrad.addColorStop(1, rgbToString(darken(localRaisedMid, 0.08)));

      tileCtx.fillStyle = leftGrad;
      tileCtx.fillRect(x, y, ridgeW, unitH);

      const bottomGrad = tileCtx.createLinearGradient(x, y + unitH - ridgeH, x, y + unitH);
      bottomGrad.addColorStop(0, rgbToString(darken(localRaisedMid, 0.06)));
      bottomGrad.addColorStop(1, rgbToString(localDeepShadow));

      tileCtx.fillStyle = bottomGrad;
      tileCtx.fillRect(x, y + unitH - ridgeH, unitW, ridgeH);

      const rightGrad = tileCtx.createLinearGradient(x + unitW - ridgeW, y, x + unitW, y);
      rightGrad.addColorStop(0, rgbToString(darken(localRaisedMid, 0.05)));
      rightGrad.addColorStop(1, rgbToString(localDeepShadow));

      tileCtx.fillStyle = rightGrad;
      tileCtx.fillRect(x + unitW - ridgeW, y, ridgeW, unitH);

      tileCtx.globalAlpha = 0.16 + waffleDepth * 0.18;
      tileCtx.fillStyle = "black";
      tileCtx.fillRect(centerX, centerY, centerW, 1);
      tileCtx.fillRect(centerX, centerY, 1, centerH);

      tileCtx.globalAlpha = 0.16 + textureAmount * 0.1;
      tileCtx.fillStyle = "white";
      tileCtx.fillRect(x + Math.floor(ridgeW * 0.38), y, 1, unitH);
      tileCtx.fillRect(x, y + Math.floor(ridgeH * 0.38), unitW, 1);

      tileCtx.globalAlpha = 1;
    }
  }

  const fuzzCount = Math.floor(60 + textureAmount * 160);

  for (let i = 0; i < fuzzCount; i++) {
    const horizontal = Math.random() > 0.42;

    const fx = Math.random() * tileWidth;
    const fy = Math.random() * tileHeight;
    const len = 2 + Math.random() * Math.max(cellWidth, cellHeight) * 3;

    tileCtx.globalAlpha = Math.random() * 0.13;
    tileCtx.strokeStyle =
      Math.random() > 0.25 ? "rgba(255,255,255,0.95)" : "rgba(95,85,70,0.65)";
    tileCtx.lineWidth = Math.random() > 0.85 ? 2 : 1;
    tileCtx.beginPath();

    if (horizontal) {
      tileCtx.moveTo(fx, fy);
      tileCtx.lineTo(fx + len, fy + (Math.random() - 0.5) * 2);
    } else {
      tileCtx.moveTo(fx, fy);
      tileCtx.lineTo(fx + (Math.random() - 0.5) * 2, fy + len);
    }

    tileCtx.stroke();
  }

  tileCtx.globalAlpha = 0.1 + waffleDepth * 0.12;
  tileCtx.strokeStyle = "rgba(60,55,45,0.55)";
  tileCtx.lineWidth = 1;

  for (let x = 0; x <= tileWidth; x += unitW) {
    tileCtx.beginPath();
    tileCtx.moveTo(x + 0.5, 0);
    tileCtx.lineTo(x + 0.5, tileHeight);
    tileCtx.stroke();
  }

  for (let y = 0; y <= tileHeight; y += unitH) {
    tileCtx.beginPath();
    tileCtx.moveTo(0, y + 0.5);
    tileCtx.lineTo(tileWidth, y + 0.5);
    tileCtx.stroke();
  }

  tileCtx.globalAlpha = 1;

  return ctx.createPattern(tile, "repeat");
}
