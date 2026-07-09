import {
  FABRIC_PRESETS,
  TEXTILE_PRESET_OPTIONS,
  formatSizeLabel,
  type FabricDesign,
  type RulerUnit,
  type TextilePresetId,
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

const groupedTextilePresetOptions = FABRIC_PRESETS.map((fabric) => ({
  label: fabric.label,
  options: TEXTILE_PRESET_OPTIONS.map((option) => {
    const preset = resolveTextilePreset(option.id);
    return {
      id: option.id,
      fabricId: preset.fabricId,
      sizeLabel: preset.sizeLabel,
      sortArea: preset.canvasWidth * preset.canvasHeight,
      sortWidth: preset.canvasWidth,
      sortHeight: preset.canvasHeight,
    };
  })
    .filter((option) => option.fabricId === fabric.id)
    .sort(
      (left, right) =>
        left.sortArea - right.sortArea ||
        left.sortWidth - right.sortWidth ||
        left.sortHeight - right.sortHeight ||
        left.sizeLabel.localeCompare(right.sizeLabel),
    ),
}));

export function FabricSizeSelect({ design, dispatch, unit, onUnitChange }: FabricSizeSelectProps) {
  return (
    <Section
      title="Fabric & Size"
      action={<UnitSegment unit={unit} onChange={onUnitChange} />}
    >
      <div className="mt-3">
        <Select
          value={design.textilePreset}
          onChange={(event) =>
            dispatch({
              type: "SET_TEXTILE_PRESET",
              textilePreset: event.target.value as TextilePresetId,
            })
          }
        >
          {groupedTextilePresetOptions.map((group) => (
            <optgroup
              key={group.label}
              label={group.label}
              className="font-semibold text-stone-900"
            >
              {group.options.map((option) => {
                const preset = resolveTextilePreset(option.id);
                return (
                  <option key={option.id} value={option.id}>
                    {formatSizeLabel(preset.widthInches, preset.heightInches, unit)}
                  </option>
                );
              })}
            </optgroup>
          ))}
        </Select>
      </div>
    </Section>
  );
}

type BodyColorControlsProps = {
  body: FabricDesign["body"];
  dispatch: FabricDesignDispatch;
};

export function BodyColorControls({ body, dispatch }: BodyColorControlsProps) {
  return (
    <Section title="Body Color">
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
    <Section title="Weave / Output">
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
