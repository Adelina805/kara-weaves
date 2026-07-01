export type WeaveType = "plain" | "waffle" | "loose";

export type OutputSize = 512 | 768 | 1024 | 1536;

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

export type BorderConfig = {
  enabled: boolean;
  top: number;
  bottom: number;
  left: number;
  right: number;
  warpColor: string;
  weftColor: string;
};

export type LooseWeaveParams = {
  openness: number;
  irregularity: number;
  threadOpacity: number;
};

export type WaffleWeaveParams = {
  cellScale: number;
  depth: number;
};

export type WeaveSettings = {
  warpThickness: number;
  weftThickness: number;
  loose: LooseWeaveParams;
  waffle: WaffleWeaveParams;
};

export type RulerSettings = {
  enabled: boolean;
  pixelsPerCm: number;
};

export type FabricDesign = {
  weaveType: WeaveType;
  outputSize: OutputSize;
  body: {
    warpColor: string;
    weftColor: string;
  };
  borders: BorderConfig;
  stripes: Stripe[];
  weave: WeaveSettings;
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
  loose: LooseWeaveParams;
  waffle: WaffleWeaveParams;
};

export type NewStripeDraft = {
  width: number;
  warpColor: string;
  weftColor: string;
};
