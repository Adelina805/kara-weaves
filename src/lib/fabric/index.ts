export { hexToRgb, rgbToString, clamp, mix, darken, lighten, adjustColor } from "./color";
export {
  DEFAULT_FABRIC_DESIGN,
  DEFAULT_ACTIVE_STRIPE_BRUSH,
  FIXED_WARP_THICKNESS,
  FIXED_WEFT_THICKNESS,
  RENDER_DEBOUNCE_MS,
  RENDER_DEFAULTS,
} from "./defaults";
export { downloadFabricPng } from "./export/download-png";
export {
  clampStripePosition,
  computeCenteredStripePosition,
  getCanvasPointerPosition,
  rectIntersection,
} from "./geometry";
export { applyGlobalSoftness } from "./render/apply-softness";
export {
  drawHorizontalRuler,
  drawRulerCorner,
  drawVerticalRuler,
} from "./render/draw-rulers";
export { fillPatternRect } from "./render/fill-pattern";
export { renderFabric } from "./render/render-fabric";
export { findStripeAtPoint, type StripeHit } from "./stripes/hit-test";
export {
  getStripeWidthLimitsPx,
  MIN_STRIPE_WIDTH_INCHES,
  MAX_STRIPE_WIDTH_INCHES,
} from "./stripe-limits";
export {
  CANVAS_SIZE_PRESETS,
  DEFAULT_TEXTILE_PRESET_ID,
  FABRIC_PRESETS,
  TEXTILE_PRESET_OPTIONS,
  buildTextilePresetId,
  getTextilePixelsPerCm,
  getTextilePixelsPerInch,
  getTextilePresetId,
  inchesToPixels,
  INCHES_TO_CM,
  pixelsToInches,
  resolveTextilePreset,
} from "./textile-presets";
export type {
  CanvasSizePreset,
  FabricPreset,
  ResolvedTextilePreset,
  TextilePresetOption,
} from "./textile-presets";
export type {
  ColorBand,
  CanvasSizePresetId,
  FabricDesign,
  FabricPresetId,
  LooseWeaveParams,
  ActiveStripeBrush,
  Rect,
  RenderDefaults,
  RGB,
  RulerSettings,
  RulerUnit,
  Stripe,
  StripeOrientation,
  TextilePresetId,
  WaffleWeaveParams,
  WeavePatternParams,
  WeaveSettings,
  WeaveType,
} from "./types";
export { createWeavePattern } from "./weaves/create-weave-pattern";
export {
  displayUnitToPixels,
  formatDisplayValue,
  formatSizeLabel,
  getPixelsPerDisplayUnit,
  getUnitSuffix,
  pixelsToDisplayUnit,
} from "./units";
