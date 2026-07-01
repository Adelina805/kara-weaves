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
    <Section title="Loose Weave Settings">
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
    <Section title="Waffle Weave Settings">
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

type RulerControlsProps = {
  rulers: FabricDesign["rulers"];
  dispatch: FabricDesignDispatch;
};

export function RulerControls({ rulers, dispatch }: RulerControlsProps) {
  return (
    <Section title="Centimeter Rulers">
      <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-800">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-stone-300 accent-blue-600"
          checked={rulers.enabled}
          onChange={(event) =>
            dispatch({ type: "SET_RULERS_ENABLED", enabled: event.target.checked })
          }
        />
        Show centimeter rulers
      </label>
      <Field label="Pixels per centimeter">
        <RangeInput
          min={20}
          max={100}
          value={rulers.pixelsPerCm}
          valueLabel={rulers.pixelsPerCm}
          onChange={(event) =>
            dispatch({ type: "SET_PIXELS_PER_CM", value: Number(event.target.value) })
          }
        />
      </Field>
      <p className="mt-2 text-xs text-stone-500">
        Small ticks = 1 mm, medium ticks = 0.5 cm, numbered ticks = 1 cm.
      </p>
    </Section>
  );
}

export type { WeaveType };
