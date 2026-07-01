import type { FabricDesign, NewStripeDraft, RenderDefaults } from "./types";

export const RENDER_DEFAULTS: RenderDefaults = {
  textureAmount: 0.85,
  softness: 0.1,
  intersectionDarkness: 0.4,
};

export const OUTPUT_SIZE_OPTIONS = [512, 768, 1024, 1536] as const;

export const DEFAULT_NEW_STRIPE: NewStripeDraft = {
  width: 55,
  warpColor: "#d94893",
  weftColor: "#f0a4cf",
};

export const DEFAULT_FABRIC_DESIGN: FabricDesign = {
  weaveType: "loose",
  outputSize: 768,
  body: {
    warpColor: "#e8e4d8",
    weftColor: "#f7f5ee",
  },
  borders: {
    enabled: false,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    warpColor: "#c8322d",
    weftColor: "#c8322d",
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
    pixelsPerCm: 40,
  },
};

export const RENDER_DEBOUNCE_MS = 60;
