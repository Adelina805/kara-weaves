import { canvasFontFamily } from "@/lib/fonts";
import type { RulerUnit } from "../types";

const RULER_BG = "rgba(250, 250, 245, 0.96)";
const RULER_CORNER_BG = "rgba(235, 235, 225, 0.96)";
const RULER_INK = "rgba(20, 20, 20, 0.85)";
const RULER_LABEL = "rgba(20, 20, 20, 0.90)";

const MIN_TICK_SPACING_PX = 6;
const MIN_LABEL_SPACING_PX = 32;

type UnitConfig = {
  label: string;
  /** Subdivision counts to try, coarsest last (e.g. inch-only = 1, eighth-inch = 8). */
  divisionLevels: number[];
  halfDivision: (divisions: number) => number;
};

function getUnitConfig(unit: RulerUnit): UnitConfig {
  if (unit === "imperial") {
    return {
      label: "in",
      divisionLevels: [1, 2, 4, 8],
      halfDivision: (divisions) => Math.max(1, divisions / 2),
    };
  }

  return {
    label: "cm",
    divisionLevels: [1, 2, 5, 10],
    halfDivision: (divisions) => Math.max(1, divisions / 2),
  };
}

type TickLevel = {
  divisions: number;
  labelEvery: number;
};

function resolveTickLevel(pixelsPerMajorUnit: number, unit: RulerUnit): TickLevel {
  const { divisionLevels } = getUnitConfig(unit);

  for (let index = divisionLevels.length - 1; index >= 0; index -= 1) {
    const divisions = divisionLevels[index];
    const stepPx = pixelsPerMajorUnit / divisions;
    if (stepPx >= MIN_TICK_SPACING_PX) {
      let labelEvery = 1;
      while (labelEvery < 100 && pixelsPerMajorUnit * labelEvery < MIN_LABEL_SPACING_PX) {
        labelEvery += 1;
      }
      return { divisions, labelEvery };
    }
  }

  let labelEvery = 1;
  while (labelEvery < 100 && pixelsPerMajorUnit * labelEvery < MIN_LABEL_SPACING_PX) {
    labelEvery += 1;
  }

  return { divisions: 1, labelEvery };
}

function drawRulerBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cornerSize: number,
): void {
  ctx.fillStyle = RULER_BG;
  ctx.fillRect(0, 0, width, height);

  if (cornerSize > 0) {
    ctx.fillStyle = RULER_CORNER_BG;
    ctx.fillRect(0, 0, cornerSize, cornerSize);
  }
}

function drawTicks(
  ctx: CanvasRenderingContext2D,
  length: number,
  rulerSize: number,
  pixelsPerMajorUnit: number,
  unit: RulerUnit,
  orientation: "horizontal" | "vertical",
): void {
  const { halfDivision } = getUnitConfig(unit);
  const { divisions, labelEvery } = resolveTickLevel(pixelsPerMajorUnit, unit);
  const stepPx = pixelsPerMajorUnit / divisions;
  const halfStep = halfDivision(divisions);
  const tickCount = Math.ceil(length / stepPx);

  ctx.strokeStyle = RULER_INK;
  ctx.fillStyle = RULER_LABEL;
  ctx.lineWidth = 1;
  ctx.font = `10px ${canvasFontFamily}`;
  ctx.textBaseline = "top";

  for (let index = 0; index <= tickCount; index += 1) {
    const position = index * stepPx;
    if (position > length + 0.5) {
      break;
    }

    const isMajor = index % divisions === 0;
    const isHalf = !isMajor && halfStep > 0 && index % halfStep === 0;

    let tickLength = rulerSize * 0.3;
    if (isHalf) tickLength = rulerSize * 0.48;
    if (isMajor) tickLength = rulerSize * 0.76;

    const aligned = Math.round(position) + 0.5;

    if (orientation === "horizontal") {
      ctx.beginPath();
      ctx.moveTo(aligned, rulerSize);
      ctx.lineTo(aligned, rulerSize - tickLength);
      ctx.stroke();

      if (isMajor) {
        const majorNumber = Math.round(position / pixelsPerMajorUnit);
        if (majorNumber % labelEvery === 0) {
          const label = majorNumber === 0 ? "0" : String(majorNumber);
          const labelX = majorNumber === 0 ? 4 : aligned + 2;
          ctx.fillText(label, labelX, rulerSize * 0.18);
        }
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(rulerSize, aligned);
      ctx.lineTo(rulerSize - tickLength, aligned);
      ctx.stroke();

      if (isMajor) {
        const majorNumber = Math.round(position / pixelsPerMajorUnit);
        if (majorNumber % labelEvery === 0) {
          if (majorNumber === 0) {
            ctx.fillText("0", 6, 6);
          } else {
            ctx.save();
            ctx.translate(rulerSize * 0.58, aligned + 3);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(String(majorNumber), 0, 0);
            ctx.restore();
          }
        }
      }
    }
  }
}

export function drawRulerCorner(
  ctx: CanvasRenderingContext2D,
  rulerSize: number,
  unit: RulerUnit,
): void {
  const { label } = getUnitConfig(unit);

  ctx.clearRect(0, 0, rulerSize, rulerSize);
  drawRulerBackground(ctx, rulerSize, rulerSize, rulerSize);

  ctx.fillStyle = RULER_LABEL;
  ctx.font = `9px ${canvasFontFamily}`;
  ctx.textBaseline = "top";
  ctx.fillText(label, rulerSize - 16, rulerSize - 14);
}

export function drawHorizontalRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  rulerSize: number,
  pixelsPerUnit: number,
  unit: RulerUnit,
): void {
  ctx.clearRect(0, 0, width, rulerSize);
  drawRulerBackground(ctx, width, rulerSize, 0);
  drawTicks(ctx, width, rulerSize, pixelsPerUnit, unit, "horizontal");
}

export function drawVerticalRuler(
  ctx: CanvasRenderingContext2D,
  height: number,
  rulerSize: number,
  pixelsPerUnit: number,
  unit: RulerUnit,
): void {
  ctx.clearRect(0, 0, rulerSize, height);
  drawRulerBackground(ctx, rulerSize, height, 0);
  drawTicks(ctx, height, rulerSize, pixelsPerUnit, unit, "vertical");
}
