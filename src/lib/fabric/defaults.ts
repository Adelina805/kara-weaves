import { DEFAULT_TEXTILE_PRESET_ID } from "./textile-presets";
import type { ActiveStripeBrush, FabricDesign, RenderDefaults } from "./types";

export const RENDER_DEFAULTS: RenderDefaults = {
  textureAmount: 0.85,
  softness: 0.1,
  intersectionDarkness: 0.4,
};

/** Fixed weave thickness (former slider minimum). */
export const FIXED_WARP_THICKNESS = 1;
export const FIXED_WEFT_THICKNESS = 1;

export const DEFAULT_ACTIVE_STRIPE_BRUSH: ActiveStripeBrush = {
  orientation: null,
  width: 55,
  color: "#D573A0",
};

export const DEFAULT_FABRIC_DESIGN: FabricDesign = {
  weaveType: "plain",
  textilePreset: DEFAULT_TEXTILE_PRESET_ID,
  body: {
    warpColor: "#F7F3ED",
    weftColor: "#F7F3ED",
  },
  stripes: [],
  weave: {
    loose: {
      openness: 90,
      irregularity: 60,
      threadOpacity: 65,
    },
    waffle: {
      cellScale: 10,
      depth: 80,
    },
  },
  rulers: {
    enabled: true,
    unit: "imperial",
  },
};

export const RENDER_DEBOUNCE_MS = 60;
