import type { FabricDesign } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Checkbox, Field, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";

type BorderControlsProps = {
  borders: FabricDesign["borders"];
  dispatch: FabricDesignDispatch;
};

export function BorderControls({ borders, dispatch }: BorderControlsProps) {
  return (
    <Section title="Borders">
      <Checkbox
        label="Enable borders"
        checked={borders.enabled}
        onChange={(event) =>
          dispatch({ type: "SET_BORDERS_ENABLED", enabled: event.target.checked })
        }
      />
      <Field label="Border vertical / warp color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={borders.warpColor}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_WARP_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Field label="Border horizontal / weft color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={borders.weftColor}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_WEFT_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Field label="Top border">
        <RangeInput
          min={0}
          max={300}
          value={borders.top}
          valueLabel={borders.top}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_TOP", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Bottom border">
        <RangeInput
          min={0}
          max={300}
          value={borders.bottom}
          valueLabel={borders.bottom}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_BOTTOM", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Left border">
        <RangeInput
          min={0}
          max={300}
          value={borders.left}
          valueLabel={borders.left}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_LEFT", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Right border">
        <RangeInput
          min={0}
          max={300}
          value={borders.right}
          valueLabel={borders.right}
          onChange={(event) =>
            dispatch({ type: "SET_BORDER_RIGHT", value: Number(event.target.value) })
          }
        />
      </Field>
    </Section>
  );
}
