import type { ResolvedTextilePreset } from "./textile-presets";

export const MIN_STRIPE_WIDTH_INCHES = 0.1;
export const MAX_STRIPE_WIDTH_INCHES = 12;

export function getStripeWidthLimitsPx(resolved: ResolvedTextilePreset): {
  min: number;
  max: number;
} {
  const pixelsPerInch = resolved.canvasWidth / resolved.widthInches;

  return {
    min: MIN_STRIPE_WIDTH_INCHES * pixelsPerInch,
    max: MAX_STRIPE_WIDTH_INCHES * pixelsPerInch,
  };
}
