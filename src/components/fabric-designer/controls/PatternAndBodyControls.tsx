import {
  FABRIC_PRESETS,
  CANVAS_SIZE_PRESETS,
  buildTextilePresetId,
  formatSizeLabel,
  type CanvasSizePresetId,
  type FabricDesign,
  type FabricPresetId,
  type RulerUnit,
  resolveTextilePreset,
} from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { Field, Select } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import { UnitSegment } from "./UnitSegment";

type FabricSizeSelectProps = {
  design: FabricDesign;
  dispatch: FabricDesignDispatch;
  unit: RulerUnit;
  onUnitChange: (unit: RulerUnit) => void;
};

const sortedCanvasSizePresets = [...CANVAS_SIZE_PRESETS].sort(
  (left, right) =>
    left.widthPx * left.heightPx - right.widthPx * right.heightPx ||
    left.widthPx - right.widthPx ||
    left.heightPx - right.heightPx ||
    left.label.localeCompare(right.label),
);

export function FabricSizeSelect({ design, dispatch, unit, onUnitChange }: FabricSizeSelectProps) {
  const { fabricId, sizeId } = resolveTextilePreset(design.textilePreset);

  return (
    <Section
      title="Textile"
      action={<UnitSegment unit={unit} onChange={onUnitChange} />}
      collapsible
    >
      <Field label="Fabric">
        <Select
          value={fabricId}
          onChange={(event) =>
            dispatch({
              type: "SET_TEXTILE_PRESET",
              textilePreset: buildTextilePresetId(
                event.target.value as FabricPresetId,
                sizeId,
              ),
            })
          }
        >
          {FABRIC_PRESETS.map((fabric) => (
            <option key={fabric.id} value={fabric.id}>
              {fabric.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Size">
        <Select
          value={sizeId}
          onChange={(event) =>
            dispatch({
              type: "SET_TEXTILE_PRESET",
              textilePreset: buildTextilePresetId(
                fabricId,
                event.target.value as CanvasSizePresetId,
              ),
            })
          }
        >
          {sortedCanvasSizePresets.map((size) => (
            <option key={size.id} value={size.id}>
              {formatSizeLabel(size.widthInches, size.heightInches, unit)}
            </option>
          ))}
        </Select>
      </Field>
    </Section>
  );
}

type BodyColorControlsProps = {
  body: FabricDesign["body"];
  dispatch: FabricDesignDispatch;
};

export function BodyColorControls({ body, dispatch }: BodyColorControlsProps) {
  return (
    <Section title="Body Color" collapsible defaultCollapsed>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
        <ColorPickerField
          id="body-warp-color"
          label="Warp Color (Vertical)"
          value={body.warpColor}
          onChange={(color) => dispatch({ type: "SET_BODY_WARP_COLOR", color })}
        />
        <ColorPickerField
          id="body-weft-color"
          label="Weft Color (Horizontal)"
          value={body.weftColor}
          onChange={(color) => dispatch({ type: "SET_BODY_WEFT_COLOR", color })}
        />
      </div>
    </Section>
  );
}

