import { INCHES_TO_CM } from "./textile-presets";
import type { ResolvedTextilePreset } from "./textile-presets";
import type { RulerUnit } from "./types";

export function getPixelsPerDisplayUnit(
  resolved: ResolvedTextilePreset,
  unit: RulerUnit,
): number {
  return unit === "imperial"
    ? resolved.canvasWidth / resolved.widthInches
    : resolved.canvasWidth / (resolved.widthInches * INCHES_TO_CM);
}

export function pixelsToDisplayUnit(
  pixels: number,
  pixelsPerDisplayUnit: number,
): number {
  return pixels / pixelsPerDisplayUnit;
}

export function displayUnitToPixels(
  value: number,
  pixelsPerDisplayUnit: number,
): number {
  return Math.round(value * pixelsPerDisplayUnit);
}

export function formatDisplayValue(value: number, unit: RulerUnit): string {
  const decimals = unit === "imperial" ? 2 : 1;
  const factor = 10 ** decimals;

  // Pixel-to-display round-trips can land just off typed values (e.g. 5 -> 5.011).
  // Snap to the nearest tenth when within tolerance so whole-number input displays cleanly.
  const nearestTenth = Math.round(value * 10) / 10;
  if (Math.abs(value - nearestTenth) < 0.02) {
    return nearestTenth.toFixed(decimals);
  }

  return (Math.round(value * factor) / factor).toFixed(decimals);
}

export function getUnitSuffix(unit: RulerUnit): string {
  return unit === "imperial" ? "in" : "cm";
}

export function formatSizeLabel(
  widthInches: number,
  heightInches: number,
  unit: RulerUnit,
): string {
  if (unit === "imperial") {
    return `${widthInches} × ${heightInches} in`;
  }

  const widthCm = (widthInches * INCHES_TO_CM).toFixed(1);
  const heightCm = (heightInches * INCHES_TO_CM).toFixed(1);
  return `${widthCm} × ${heightCm} cm`;
}
