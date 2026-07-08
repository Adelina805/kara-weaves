import {
  TEXTILE_PRESET_OPTIONS,
  type FabricDesign,
  type TextilePresetId,
} from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Field, Select } from "@/components/ui/Field";
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
    <Section title="Body">
      <Field label="Body vertical / warp color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={body.warpColor}
          onChange={(event) =>
            dispatch({ type: "SET_BODY_WARP_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Field label="Body horizontal / weft color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={body.weftColor}
          onChange={(event) =>
            dispatch({ type: "SET_BODY_WEFT_COLOR", color: event.target.value })
          }
        />
      </Field>
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
          className="w-full accent-blue-600"
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
          className="w-full accent-blue-600"
        />
      </Field>
    </Section>
  );
}
