import type { FabricDesign, WeaveType } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Field, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";

type LooseWeaveControlsProps = {
  loose: FabricDesign["weave"]["loose"];
  dispatch: FabricDesignDispatch;
  visible: boolean;
};

export function LooseWeaveControls({ loose, dispatch, visible }: LooseWeaveControlsProps) {
  if (!visible) {
    return null;
  }

  return (
    <Section title="Loose Weave Settings" collapsible defaultCollapsed>
      <Field label="Loose weave openness">
        <RangeInput
          min={0}
          max={100}
          value={loose.openness}
          valueLabel={loose.openness}
          onChange={(event) =>
            dispatch({ type: "SET_LOOSE_OPENNESS", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Loose weave irregularity">
        <RangeInput
          min={0}
          max={100}
          value={loose.irregularity}
          valueLabel={loose.irregularity}
          onChange={(event) =>
            dispatch({ type: "SET_LOOSE_IRREGULARITY", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Loose thread opacity">
        <RangeInput
          min={20}
          max={100}
          value={loose.threadOpacity}
          valueLabel={loose.threadOpacity}
          onChange={(event) =>
            dispatch({ type: "SET_LOOSE_THREAD_OPACITY", value: Number(event.target.value) })
          }
        />
      </Field>
      <p className="mt-2 text-xs text-stone-500">
        Higher openness creates wider visible gaps. Lower thread opacity makes the cloth look
        airy and translucent.
      </p>
    </Section>
  );
}

type WaffleWeaveControlsProps = {
  waffle: FabricDesign["weave"]["waffle"];
  dispatch: FabricDesignDispatch;
  visible: boolean;
};

export function WaffleWeaveControls({ waffle, dispatch, visible }: WaffleWeaveControlsProps) {
  if (!visible) {
    return null;
  }

  return (
    <Section title="Waffle Weave Settings" collapsible defaultCollapsed>
      <Field label="Waffle cell size">
        <RangeInput
          min={4}
          max={16}
          value={waffle.cellScale}
          valueLabel={waffle.cellScale}
          onChange={(event) =>
            dispatch({ type: "SET_WAFFLE_CELL_SCALE", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="Waffle depth / raised texture">
        <RangeInput
          min={0}
          max={100}
          value={waffle.depth}
          valueLabel={waffle.depth}
          onChange={(event) =>
            dispatch({ type: "SET_WAFFLE_DEPTH", value: Number(event.target.value) })
          }
        />
      </Field>
    </Section>
  );
}

export type { WeaveType };
