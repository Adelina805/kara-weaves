import type { ActiveStripeBrush, FabricDesign, StripeOrientation, RulerUnit } from "@/lib/fabric";
import {
  displayUnitToPixels,
  formatDisplayValue,
  getUnitSuffix,
  MAX_STRIPE_WIDTH_PX,
  MIN_STRIPE_WIDTH_PX,
  pixelsToDisplayUnit,
} from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { ColorInput, Field, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import { StripeList } from "./StripeList";

type StripeControlsProps = {
  stripes: FabricDesign["stripes"];
  activeStripeBrush: ActiveStripeBrush;
  dispatch: FabricDesignDispatch;
  pixelsPerDisplayUnit: number;
  unit: RulerUnit;
  selectedStripeId: string | null;
  onSelectStripe: (id: string) => void;
  onRemoveStripe: (id: string) => void;
  onStripeWidthSlideStart?: () => void;
  onStripeWidthSlideEnd?: () => void;
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
  pixelsPerDisplayUnit,
  unit,
  selectedStripeId,
  onSelectStripe,
  onRemoveStripe,
  onStripeWidthSlideStart,
  onStripeWidthSlideEnd,
}: StripeControlsProps) {
  const selectedStripe =
    selectedStripeId === null
      ? null
      : stripes.find((stripe) => stripe.id === selectedStripeId) ?? null;

  const displayWidth = pixelsToDisplayUnit(activeStripeBrush.width, pixelsPerDisplayUnit);

  return (
    <Section
      title="STRIPE TOOL"
      info={
        <>
          - Click the textile to place stripes. Drag to reposition.
          <br />
          - Choose orientation to activate, click again to turn off.
          <br />
          - Select a stripe to change color or width.
        </>
      }
    >
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
          onChange={(event) => {
            const color = event.target.value;
            dispatch({ type: "SET_ACTIVE_STRIPE_COLOR", color });
            if (selectedStripe) {
              dispatch({ type: "UPDATE_STRIPE", id: selectedStripe.id, color });
            }
          }}
        />
      </Field>
      <Field label={`Stripe Width (${getUnitSuffix(unit)})`}>
        <RangeInput
          min={pixelsToDisplayUnit(MIN_STRIPE_WIDTH_PX, pixelsPerDisplayUnit)}
          max={pixelsToDisplayUnit(MAX_STRIPE_WIDTH_PX, pixelsPerDisplayUnit)}
          step={1 / pixelsPerDisplayUnit}
          value={displayWidth}
          valueLabel={formatDisplayValue(displayWidth, unit)}
          className="accent-stone-900"
          onPointerDown={() => onStripeWidthSlideStart?.()}
          onPointerUp={() => onStripeWidthSlideEnd?.()}
          onPointerCancel={() => onStripeWidthSlideEnd?.()}
          onChange={(event) => {
            const width = displayUnitToPixels(Number(event.target.value), pixelsPerDisplayUnit);
            dispatch({ type: "SET_ACTIVE_STRIPE_WIDTH", value: width });
            if (selectedStripe) {
              dispatch({ type: "UPDATE_STRIPE", id: selectedStripe.id, width });
            }
          }}
        />
      </Field>
      <StripeList
        stripes={stripes}
        pixelsPerDisplayUnit={pixelsPerDisplayUnit}
        unit={unit}
        selectedId={selectedStripeId}
        onSelect={onSelectStripe}
        onRemove={onRemoveStripe}
      />
    </Section>
  );
}
