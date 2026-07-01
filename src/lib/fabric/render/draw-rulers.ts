import { canvasFontFamily } from "@/lib/fonts";
import type { RulerSettings } from "../types";

export function drawRulers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rulers: RulerSettings,
): void {
  if (!rulers.enabled) {
    return;
  }

  const rulerSize = 42;
  const pixelsPerCm = rulers.pixelsPerCm;
  const minorTick = pixelsPerCm / 10;
  const oneCm = pixelsPerCm;

  ctx.save();

  ctx.fillStyle = "rgba(250, 250, 245, 0.90)";
  ctx.fillRect(0, 0, width, rulerSize);
  ctx.fillRect(0, 0, rulerSize, height);

  ctx.fillStyle = "rgba(235, 235, 225, 0.96)";
  ctx.fillRect(0, 0, rulerSize, rulerSize);

  ctx.strokeStyle = "rgba(20, 20, 20, 0.85)";
  ctx.fillStyle = "rgba(20, 20, 20, 0.90)";
  ctx.lineWidth = 1;
  ctx.font = `10px ${canvasFontFamily}`;
  ctx.textBaseline = "top";

  for (let x = 0; x <= width; x += minorTick) {
    const tickIndex = Math.round(x / minorTick);
    const isCm = tickIndex % 10 === 0;
    const isHalfCm = tickIndex % 5 === 0;

    let tickLength = rulerSize * 0.32;
    if (isHalfCm) tickLength = rulerSize * 0.5;
    if (isCm) tickLength = rulerSize * 0.78;

    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, tickLength);
    ctx.stroke();

    if (isCm) {
      const cmNumber = Math.round(x / oneCm);
      if (cmNumber === 0) {
        ctx.fillText("0", 4, rulerSize * 0.56);
      } else {
        ctx.fillText(String(cmNumber), x + 3, rulerSize * 0.56);
      }
    }
  }

  for (let y = 0; y <= height; y += minorTick) {
    const tickIndex = Math.round(y / minorTick);
    const isCm = tickIndex % 10 === 0;
    const isHalfCm = tickIndex % 5 === 0;

    let tickLength = rulerSize * 0.32;
    if (isHalfCm) tickLength = rulerSize * 0.5;
    if (isCm) tickLength = rulerSize * 0.78;

    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(tickLength, y + 0.5);
    ctx.stroke();

    if (isCm) {
      const cmNumber = Math.round(y / oneCm);
      if (cmNumber === 0) {
        ctx.fillText("0", 6, 6);
      } else {
        ctx.save();
        ctx.translate(rulerSize * 0.58, y + 3);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(String(cmNumber), 0, 0);
        ctx.restore();
      }
    }
  }

  ctx.strokeStyle = "rgba(20, 20, 20, 0.65)";
  ctx.beginPath();
  ctx.moveTo(0, rulerSize + 0.5);
  ctx.lineTo(width, rulerSize + 0.5);
  ctx.moveTo(rulerSize + 0.5, 0);
  ctx.lineTo(rulerSize + 0.5, height);
  ctx.stroke();

  ctx.fillStyle = "rgba(20, 20, 20, 0.85)";
  ctx.font = `9px ${canvasFontFamily}`;
  ctx.fillText("cm", rulerSize - 18, rulerSize - 14);

  ctx.restore();
}
