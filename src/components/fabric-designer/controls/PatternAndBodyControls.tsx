import { OUTPUT_SIZE_OPTIONS, type FabricDesign, type WeaveType } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Field, Select } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";

type PatternTypeSelectProps = {
  weaveType: WeaveType;
  dispatch: FabricDesignDispatch;
};

export function PatternTypeSelect({ weaveType, dispatch }: PatternTypeSelectProps) {
  return (
    <Section title="Pattern Type">
      <Field label="Choose weave pattern">
        <Select
          value={weaveType}
          onChange={(event) =>
            dispatch({ type: "SET_WEAVE_TYPE", weaveType: event.target.value as WeaveType })
          }
        >
          <option value="plain">Plain weave</option>
          <option value="waffle">Waffle weave</option>
          <option value="loose">Loose weave / gauze weave</option>
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
      <Field label="Output size">
        <Select
          value={design.outputSize}
          onChange={(event) =>
            dispatch({
              type: "SET_OUTPUT_SIZE",
              outputSize: Number(event.target.value) as FabricDesign["outputSize"],
            })
          }
        >
          {OUTPUT_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} × {size}
            </option>
          ))}
        </Select>
      </Field>
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
