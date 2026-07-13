export type DesignStatus = "draft" | "validation_failed" | "validated" | "approved" | "archived";

export type OrderStatus =
  | "draft"
  | "assigned"
  | "in_production"
  | "quality_check"
  | "ready"
  | "delivered"
  | "cancelled";

export type ProductionStage =
  | "design_approved"
  | "assigned_to_cooperative"
  | "warping"
  | "on_loom"
  | "weaving"
  | "finishing"
  | "quality_check"
  | "ready"
  | "delivered";

export type ValidationSeverity = "info" | "warning" | "error";

export type Product = {
  id: string;
  name: string;
  category: string;
  defaultWidthIn: number;
  defaultLengthIn: number;
};

export type ColorYarn = {
  id: string;
  name: string;
  hexCode: string;
  yarnCode?: string;
  material: string;
};

export type Cooperative = {
  id: string;
  name: string;
  location: string;
  story: string;
  contactName: string;
};

export type Loom = {
  id: string;
  cooperativeId: string;
  loomCode: string;
  loomName: string;
  loomType: string;
  maxWidthIn: number;
};

export type LoomSpec = {
  id: string;
  name: string;
  loomId: string;
  maxWeaveWidthIn: number;
  reedDensityDpi: number;
  defaultPpi: number;
  minPpi: number;
  maxPpi: number;
  takeupPct: number;
  shrinkagePct: number;
  beatTensionNotes: string;
  compatibilityNotes: string;
  isActive: boolean;
};

export type DesignSegment = {
  id: string;
  sortOrder: number;
  segmentType: "stripe" | "body" | "border";
  colorId: string;
  lengthIn: number;
  repeatCount: number;
  notes?: string;
};

export type Design = {
  id: string;
  title: string;
  productId: string;
  designerName: string;
  loomSpecId: string;
  widthIn: number;
  finishedLengthIn: number;
  targetPpi: number;
  status: DesignStatus;
  notes: string;
  segments: DesignSegment[];
};

export type ValidationResult = {
  ruleCode: string;
  severity: ValidationSeverity;
  message: string;
  measuredValue?: number;
  expectedMin?: number;
  expectedMax?: number;
};

export type RecipePick = {
  sortOrder: number;
  segmentType: DesignSegment["segmentType"];
  colorName: string;
  hexCode: string;
  yarnCode: string;
  lengthIn: number;
  calculatedPicks: number;
  repeatCount: number;
};

export type TechnicalRecipe = {
  designId: string;
  version: number;
  totalPicks: number;
  estimatedOnLoomLengthIn: number;
  pickSequence: RecipePick[];
  setupSummary: {
    loomSpecName: string;
    widthIn: number;
    targetPpi: number;
    reedDensityDpi: number;
    takeupPct: number;
    shrinkagePct: number;
  };
  artisanNotes: string;
};

export type Order = {
  id: string;
  orderCode: string;
  designId: string;
  cooperativeId: string;
  loomId: string;
  buyerDisplayName: string;
  buyerPublicToken: string;
  status: OrderStatus;
  buyerMessage: string;
  publishedAt: string;
};

export type ProductionEvent = {
  id: string;
  orderId: string;
  stage: ProductionStage;
  statusLabel: string;
  notes: string;
  visibleToBuyer: boolean;
  occurredAt: string;
};

export type MvpDataset = {
  products: Product[];
  colors: ColorYarn[];
  cooperatives: Cooperative[];
  looms: Loom[];
  loomSpecs: LoomSpec[];
  designs: Design[];
  orders: Order[];
  productionEvents: ProductionEvent[];
};
