import { DEFAULT_TEXTILE_PRESET_ID } from "./textile-presets";
import type { ActiveStripeBrush, FabricDesign, RenderDefaults } from "./types";

export const RENDER_DEFAULTS: RenderDefaults = {
  textureAmount: 0.85,
  softness: 0.1,
  intersectionDarkness: 0.4,
};

export const DEFAULT_ACTIVE_STRIPE_BRUSH: ActiveStripeBrush = {
  orientation: "horizontal",
  width: 55,
  color: "#D573A0",
};

export const DEFAULT_FABRIC_DESIGN: FabricDesign = {
  weaveType: "plain",
  textilePreset: DEFAULT_TEXTILE_PRESET_ID,
  body: {
    warpColor: "#E3E0DB",
    weftColor: "#E3E0DB",
  },
  stripes: [],
  weave: {
    warpThickness: 3,
    weftThickness: 3,
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
    enabled: false,
    unit: "imperial",
  },
};

export const RENDER_DEBOUNCE_MS = 60;
