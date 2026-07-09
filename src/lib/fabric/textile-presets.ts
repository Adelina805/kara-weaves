import type {
  CanvasSizePresetId,
  FabricPresetId,
  TextilePresetId,
  WeaveType,
} from "./types";

export type FabricPreset = {
  id: FabricPresetId;
  label: string;
  weaveType: WeaveType;
};

export type CanvasSizePreset = {
  id: CanvasSizePresetId;
  label: string;
  widthPx: number;
  heightPx: number;
  widthInches: number;
  heightInches: number;
};

export const INCHES_TO_CM = 2.54;

export type TextilePresetOption = {
  id: TextilePresetId;
  label: string;
};

export type ResolvedTextilePreset = {
  textilePreset: TextilePresetId;
  fabricId: FabricPresetId;
  sizeId: CanvasSizePresetId;
  weaveType: WeaveType;
  canvasWidth: number;
  canvasHeight: number;
  widthInches: number;
  heightInches: number;
  fabricLabel: string;
  sizeLabel: string;
};

export const FABRIC_PRESETS: readonly FabricPreset[] = [
  { id: "plain", label: "Plain Weave", weaveType: "plain" },
  { id: "loose", label: "Gauze (Loose Weave)", weaveType: "loose" },
  { id: "waffle", label: "Waffle Weave", weaveType: "waffle" },
  { id: "thorthu", label: "Thorthu Cotton", weaveType: "thorthu" },
  { id: "dobb", label: "Dobb Texture", weaveType: "dobb" },
] as const;

export const CANVAS_SIZE_PRESETS: readonly CanvasSizePreset[] = [
  { id: "12x12", label: "12 × 12 in", widthPx: 512, heightPx: 512, widthInches: 12, heightInches: 12 },
  { id: "14x21", label: "14 × 21 in", widthPx: 512, heightPx: 768, widthInches: 14, heightInches: 21 },
  { id: "20x20", label: "20 × 20 in", widthPx: 768, heightPx: 768, widthInches: 20, heightInches: 20 },
  { id: "18x28", label: "18 × 28 in", widthPx: 576, heightPx: 896, widthInches: 18, heightInches: 28 },
  { id: "40x70", label: "40 × 70 in", widthPx: 878, heightPx: 1536, widthInches: 40, heightInches: 70 },
] as const;

export const DEFAULT_TEXTILE_PRESET_ID: TextilePresetId = "plain-40x70";

const fabricById = new Map(FABRIC_PRESETS.map((fabric) => [fabric.id, fabric]));
const sizeById = new Map(CANVAS_SIZE_PRESETS.map((size) => [size.id, size]));

export function buildTextilePresetId(
  fabricId: FabricPresetId,
  sizeId: CanvasSizePresetId,
): TextilePresetId {
  return `${fabricId}-${sizeId}`;
}

export const TEXTILE_PRESET_OPTIONS: TextilePresetOption[] = FABRIC_PRESETS.flatMap(
  (fabric) =>
    CANVAS_SIZE_PRESETS.map((size) => {
      const id = buildTextilePresetId(fabric.id, size.id);
      return {
        id,
        label: `${fabric.label} — ${size.label}`,
      };
    }),
);

export function resolveTextilePreset(textilePreset: TextilePresetId): ResolvedTextilePreset {
  const separatorIndex = textilePreset.lastIndexOf("-");
  if (separatorIndex === -1) {
    return resolveTextilePreset(DEFAULT_TEXTILE_PRESET_ID);
  }

  const fabricId = textilePreset.slice(0, separatorIndex) as FabricPresetId;
  const sizeId = textilePreset.slice(separatorIndex + 1) as CanvasSizePresetId;

  const fabric = fabricById.get(fabricId);
  const size = sizeById.get(sizeId);

  if (!fabric || !size) {
    return resolveTextilePreset(DEFAULT_TEXTILE_PRESET_ID);
  }

  return {
    textilePreset,
    fabricId: fabric.id,
    sizeId: size.id,
    weaveType: fabric.weaveType,
    canvasWidth: size.widthPx,
    canvasHeight: size.heightPx,
    widthInches: size.widthInches,
    heightInches: size.heightInches,
    fabricLabel: fabric.label,
    sizeLabel: size.label,
  };
}

export function getTextilePixelsPerCm(resolved: ResolvedTextilePreset): number {
  return resolved.canvasWidth / (resolved.widthInches * INCHES_TO_CM);
}

export function getTextilePixelsPerInch(resolved: ResolvedTextilePreset): number {
  return resolved.canvasWidth / resolved.widthInches;
}

export function getTextilePresetId(
  weaveType: WeaveType,
  sizeId: CanvasSizePresetId,
): TextilePresetId {
  const fabric = FABRIC_PRESETS.find((entry) => entry.weaveType === weaveType);
  if (!fabric) {
    return DEFAULT_TEXTILE_PRESET_ID;
  }

  return buildTextilePresetId(fabric.id, sizeId);
}
