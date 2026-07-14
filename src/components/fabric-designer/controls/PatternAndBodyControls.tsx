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
import { ColorInput, Field, Select } from "@/components/ui/Field";
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
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        <label
          htmlFor="body-warp-color"
          className="text-sm font-semibold text-stone-800"
        >
          Warp Color (Vertical)
        </label>
        <label
          htmlFor="body-weft-color"
          className="text-sm font-semibold text-stone-800"
        >
          Weft Color (Horizontal)
        </label>
        <ColorInput
          id="body-warp-color"
          value={body.warpColor}
          onChange={(event) =>
            dispatch({ type: "SET_BODY_WARP_COLOR", color: event.target.value })
          }
        />
        <ColorInput
          id="body-weft-color"
          value={body.weftColor}
          onChange={(event) =>
            dispatch({ type: "SET_BODY_WEFT_COLOR", color: event.target.value })
          }
        />
      </div>
    </Section>
  );
}

type WeaveOutputControlsProps = {
  design: FabricDesign;
  dispatch: FabricDesignDispatch;
};

export function WeaveOutputControls({ design, dispatch }: WeaveOutputControlsProps) {
  return (
    <Section title="Weave / Output Constraints" collapsible defaultCollapsed>
      <Field label="Vertical weave thickness / warp thickness">
        <input
          type="range"
          min={1}
          max={30}
          value={design.weave.warpThickness}
          onChange={(event) =>
            dispatch({ type: "SET_WARP_THICKNESS", value: Number(event.target.value) })
          }
          className="w-full accent-black"
        />
      </Field>
      <Field label="Horizontal weave thickness / weft thickness">
        <input
          type="range"
          min={1}
          max={30}
          value={design.weave.weftThickness}
          onChange={(event) =>
            dispatch({ type: "SET_WEFT_THICKNESS", value: Number(event.target.value) })
          }
          className="w-full accent-black"
        />
      </Field>
    </Section>
  );
}
