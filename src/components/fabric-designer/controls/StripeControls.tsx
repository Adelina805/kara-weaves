import type { FabricDesign, NewStripeDraft } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Button } from "@/components/ui/Button";
import { ColorInput, RangeInput } from "@/components/ui/Field";
import { Section } from "@/components/ui/Section";
import { StripeList } from "./StripeList";

type StripeControlsProps = {
  stripes: FabricDesign["stripes"];
  newStripe: NewStripeDraft;
  dispatch: FabricDesignDispatch;
  onAddVertical: () => void;
  onAddHorizontal: () => void;
  onRemoveStripe: (id: string) => void;
};

export function StripeControls({
  stripes,
  newStripe,
  dispatch,
  onAddVertical,
  onAddHorizontal,
  onRemoveStripe,
}: StripeControlsProps) {
  const stripeButtonClassName = "flex items-center justify-center gap-2";

  return (
    <Section title="ADD STRIPE">
      <div className="mt-3 grid grid-cols-[132px_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5">
        <span className="text-sm font-semibold text-stone-800">Stripe color</span>
        <span className="text-sm font-semibold text-stone-800">Stripe Thickness</span>
        <ColorInput
          className="min-w-[132px]"
          value={newStripe.color}
          onChange={(event) =>
            dispatch({ type: "SET_NEW_STRIPE_COLOR", color: event.target.value })
          }
        />
        <RangeInput
          min={5}
          max={250}
          value={newStripe.width}
          valueLabel={newStripe.width}
          className="accent-stone-900"
          onChange={(event) =>
            dispatch({ type: "SET_NEW_STRIPE_WIDTH", value: Number(event.target.value) })
          }
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button className={stripeButtonClassName} onClick={onAddVertical}>
          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
            <span className="h-4.5 w-1.5 bg-white" />
          </span>
          <span>vertical</span>
        </Button>
        <Button className={stripeButtonClassName} onClick={onAddHorizontal}>
          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
            <span className="h-1.5 w-4.5 bg-white" />
          </span>
          <span>horizontal</span>
        </Button>
      </div>
      <p className="mt-2 text-xs text-stone-500">Drag stripes to reposition them on the fabric preview.</p>
      <StripeList stripes={stripes} onRemove={onRemoveStripe} />
    </Section>
  );
}
