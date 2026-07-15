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

function SelectToolIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z" />
    </svg>
  );
}

function OrientationSegment({
  orientation,
  onChange,
}: {
  orientation: StripeOrientation | null;
  onChange: (orientation: StripeOrientation | null) => void;
}) {
  const segments: {
    value: StripeOrientation | null;
    label: string;
    iconOnly?: boolean;
  }[] = [
    { value: null, label: "Select", iconOnly: true },
    { value: "vertical", label: "Vertical" },
    { value: "horizontal", label: "Horizontal" },
  ];

  return (
    <div
      className="mt-3 grid grid-cols-[1fr_2fr_2fr] gap-2"
      role="radiogroup"
      aria-label="Stripe tool"
    >
      {segments.map((segment) => {
        const isActive = orientation === segment.value;
        return (
          <button
            key={segment.label}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={segment.iconOnly ? segment.label : undefined}
            className={[
              "flex items-center justify-center rounded-md border border-stone-200 px-3 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-stone-900 text-white"
                : "bg-white text-stone-700 hover:bg-stone-100",
            ].join(" ")}
            onClick={() => onChange(segment.value)}
          >
            {segment.iconOnly ? (
              <SelectToolIcon className="h-5 w-5" />
            ) : (
              segment.label
            )}
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
      collapsible
      defaultCollapsed
    >
      <OrientationSegment
        orientation={activeStripeBrush.orientation}
        onChange={(orientation) =>
          dispatch({ type: "SET_ACTIVE_STRIPE_ORIENTATION", orientation })
        }
      />
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
