import type { Stripe } from "@/lib/fabric";
import { Button } from "@/components/ui/Button";

type StripeListProps = {
  stripes: Stripe[];
  onRemove: (id: string) => void;
};

export function StripeList({ stripes, onRemove }: StripeListProps) {
  if (stripes.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-2">
      {stripes.map((stripe, index) => (
        <li
          key={stripe.id}
          className="rounded-lg border border-stone-200 bg-stone-50 p-2 text-xs text-stone-700"
        >
          <p className="font-bold">
            {index + 1}. {stripe.orientation} stripe
          </p>
          <p>Position: {Math.round(stripe.position)} px</p>
          <p>Width: {Math.round(stripe.width)} px</p>
          {stripe.orientation === "vertical" ? (
            <p>Warp: {stripe.warpColor}</p>
          ) : (
            <p>Weft: {stripe.weftColor}</p>
          )}
          <Button
            variant="danger"
            className="mt-2 px-2 py-1 text-xs"
            onClick={() => onRemove(stripe.id)}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}
