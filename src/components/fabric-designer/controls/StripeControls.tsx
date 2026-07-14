import type { FabricDesign, NewStripeDraft } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Button } from "@/components/ui/Button";
import { Field, RangeInput } from "@/components/ui/Field";
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
  return (
    <Section title="Add Custom Stripe">
      <Field label="New stripe width">
        <RangeInput
          min={5}
          max={250}
          value={newStripe.width}
          valueLabel={newStripe.width}
          onChange={(event) =>
            dispatch({ type: "SET_NEW_STRIPE_WIDTH", value: Number(event.target.value) })
          }
        />
      </Field>
      <Field label="New stripe vertical / warp color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={newStripe.warpColor}
          onChange={(event) =>
            dispatch({ type: "SET_NEW_STRIPE_WARP_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Field label="New stripe horizontal / weft color">
        <input
          type="color"
          className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 bg-transparent p-1"
          value={newStripe.weftColor}
          onChange={(event) =>
            dispatch({ type: "SET_NEW_STRIPE_WEFT_COLOR", color: event.target.value })
          }
        />
      </Field>
      <Button fullWidth onClick={onAddVertical}>
        Add Vertical Stripe
      </Button>
      <Button fullWidth className="mt-2" onClick={onAddHorizontal}>
        Add Horizontal Stripe
      </Button>
      <p className="mt-2 text-xs text-stone-500">
        After adding a stripe, drag it directly on the fabric preview.
      </p>
      <StripeList stripes={stripes} onRemove={onRemoveStripe} />
    </Section>
  );
}
