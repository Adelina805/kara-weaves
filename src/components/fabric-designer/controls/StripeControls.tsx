import type { ActiveStripeBrush, FabricDesign, StripeOrientation } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { ColorInput, Field, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import { StripeList } from "./StripeList";

type StripeControlsProps = {
  stripes: FabricDesign["stripes"];
  activeStripeBrush: ActiveStripeBrush;
  dispatch: FabricDesignDispatch;
  onRemoveStripe: (id: string) => void;
};

function OrientationSegment({
  orientation,
  onChange,
}: {
  orientation: StripeOrientation | null;
  onChange: (orientation: StripeOrientation | null) => void;
}) {
  const segments: { value: StripeOrientation; label: string }[] = [
    { value: "horizontal", label: "Horizontal" },
    { value: "vertical", label: "Vertical" },
  ];

  return (
    <div className="grid grid-cols-2 rounded-lg border border-stone-200 p-0.5">
      {segments.map((segment) => {
        const isActive = orientation === segment.value;
        return (
          <button
            key={segment.value}
            type="button"
            className={[
              "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-stone-900 text-white"
                : "text-stone-700 hover:bg-stone-100",
            ].join(" ")}
            onClick={() => onChange(isActive ? null : segment.value)}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}

export function StripeControls({
  stripes,
  activeStripeBrush,
  dispatch,
  onRemoveStripe,
}: StripeControlsProps) {
  return (
    <Section title="STRIPE TOOL">
      <Field label="Orientation">
        <OrientationSegment
          orientation={activeStripeBrush.orientation}
          onChange={(orientation) =>
            dispatch({ type: "SET_ACTIVE_STRIPE_ORIENTATION", orientation })
          }
        />
      </Field>
      <Field label="Stripe Color">
        <ColorInput
          value={activeStripeBrush.color}
          onChange={(event) =>
            dispatch({ type: "SET_ACTIVE_STRIPE_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Field label="Stripe Width">
        <RangeInput
          min={5}
          max={250}
          value={activeStripeBrush.width}
          valueLabel={activeStripeBrush.width}
          className="accent-stone-900"
          onChange={(event) =>
            dispatch({ type: "SET_ACTIVE_STRIPE_WIDTH", value: Number(event.target.value) })
          }
        />
      </Field>
      <p className="mt-3 text-sm text-stone-500">
        Click the textile to place a stripe.
        <br />
        Drag existing stripes to reposition.
      </p>
      <StripeList stripes={stripes} onRemove={onRemoveStripe} />
    </Section>
  );
}
