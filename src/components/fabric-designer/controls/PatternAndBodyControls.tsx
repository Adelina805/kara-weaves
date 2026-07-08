import {
  TEXTILE_PRESET_OPTIONS,
  type FabricDesign,
  type TextilePresetId,
} from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { ColorInput, Field, Select } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";

type FabricSizeSelectProps = {
  design: FabricDesign;
  dispatch: FabricDesignDispatch;
};

export function FabricSizeSelect({ design, dispatch }: FabricSizeSelectProps) {
  return (
    <Section title="Fabric & Size">
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
          {TEXTILE_PRESET_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
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
