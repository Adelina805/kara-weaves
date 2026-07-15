export type WeaveType = "plain" | "waffle" | "loose" | "thorthu";

export type FabricPresetId = "plain" | "loose" | "waffle" | "thorthu";

export type CanvasSizePresetId = "12x12" | "14x21" | "20x20" | "18x28" | "40x70";

export type TextilePresetId = `${FabricPresetId}-${CanvasSizePresetId}`;

export type StripeOrientation = "vertical" | "horizontal";

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ColorBand = {
  rect: Rect;
  vertical: RGB;
  horizontal: RGB;
};

export type Stripe = {
  id: string;
  orientation: StripeOrientation;
  position: number;
  width: number;
  warpColor: string;
  weftColor: string;
};

export type RulerUnit = "metric" | "imperial";

export type RulerSettings = {
  enabled: boolean;
  unit: RulerUnit;
};

export type FabricDesign = {
  weaveType: WeaveType;
  textilePreset: TextilePresetId;
  body: {
    warpColor: string;
    weftColor: string;
  };
  stripes: Stripe[];
  rulers: RulerSettings;
};

export type RenderDefaults = {
  textureAmount: number;
  softness: number;
  intersectionDarkness: number;
};

export type WeavePatternParams = {
  weaveType: WeaveType;
  warpColor: RGB;
  weftColor: RGB;
  warpThickness: number;
  weftThickness: number;
  textureAmount: number;
};

export type ActiveStripeBrush = {
  orientation: StripeOrientation | null;
  width: number;
  color: string;
};
