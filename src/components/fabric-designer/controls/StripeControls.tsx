import type { ActiveStripeBrush, FabricDesign, StripeOrientation, RulerUnit } from "@/lib/fabric";
import {
  getUnitSuffix,
  INCHES_TO_CM,
  MAX_STRIPE_WIDTH_INCHES,
  MIN_STRIPE_WIDTH_INCHES,
  pixelsToDisplayUnit,
} from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { ColorPickerField } from "@/components/ui/ColorPickerField";
import { Field, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import { StripeList } from "./StripeList";

const STRIPE_WIDTH_STEP = 0.1;

function snapToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

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
    { value: "vertical", label: "Vertical" },
    { value: "horizontal", label: "Horizontal" },
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

  const displayUnitsPerInch = unit === "imperial" ? 1 : INCHES_TO_CM;
  const minDisplayWidth = snapToTenth(MIN_STRIPE_WIDTH_INCHES * displayUnitsPerInch);
  const maxDisplayWidth = snapToTenth(MAX_STRIPE_WIDTH_INCHES * displayUnitsPerInch);
  const pixelsPerInch = pixelsPerDisplayUnit * displayUnitsPerInch;
  const minWidthPixels = MIN_STRIPE_WIDTH_INCHES * pixelsPerInch;
  const maxWidthPixels = MAX_STRIPE_WIDTH_INCHES * pixelsPerInch;
  const displayWidth = Math.min(
    maxDisplayWidth,
    Math.max(
      minDisplayWidth,
      snapToTenth(pixelsToDisplayUnit(activeStripeBrush.width, pixelsPerDisplayUnit)),
    ),
  );

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
      collapsible
      defaultCollapsed
    >
      <Field label="Orientation">
        <OrientationSegment
          orientation={activeStripeBrush.orientation}
          onChange={(orientation) =>
            dispatch({ type: "SET_ACTIVE_STRIPE_ORIENTATION", orientation })
          }
        />
      </Field>
      <ColorPickerField
        className="mt-3"
        label="Stripe Color"
        value={activeStripeBrush.color}
        onChange={(color) => {
          dispatch({ type: "SET_ACTIVE_STRIPE_COLOR", color });
          if (selectedStripe) {
            dispatch({ type: "UPDATE_STRIPE", id: selectedStripe.id, color });
          }
        }}
      />
      <Field label={`Stripe Width (${getUnitSuffix(unit)})`}>
        <RangeInput
          editableValueLabel
          min={minDisplayWidth}
          max={maxDisplayWidth}
          step={STRIPE_WIDTH_STEP}
          value={displayWidth}
          valueLabel={displayWidth.toFixed(1)}
          className="accent-stone-900"
          onPointerDown={() => onStripeWidthSlideStart?.()}
          onPointerUp={() => onStripeWidthSlideEnd?.()}
          onPointerCancel={() => onStripeWidthSlideEnd?.()}
          onChange={(event) => {
            const snappedDisplayWidth = snapToTenth(Number(event.target.value));
            const width = Math.min(
              maxWidthPixels,
              Math.max(minWidthPixels, snappedDisplayWidth * pixelsPerDisplayUnit),
            );
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
