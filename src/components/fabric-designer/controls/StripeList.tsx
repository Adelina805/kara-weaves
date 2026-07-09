import type { RulerUnit, Stripe } from "@/lib/fabric";
import { formatDisplayValue, getUnitSuffix, pixelsToDisplayUnit } from "@/lib/fabric";

type StripeListProps = {
  stripes: Stripe[];
  pixelsPerDisplayUnit: number;
  unit: RulerUnit;
  onRemove: (id: string) => void;
};

export function StripeList({ stripes, pixelsPerDisplayUnit, unit, onRemove }: StripeListProps) {
  if (stripes.length === 0) {
    return null;
  }

  const suffix = getUnitSuffix(unit);

  return (
    <ul className="mt-3 space-y-2">
      {stripes.map((stripe, index) => (
        <li
          key={stripe.id}
          className="relative rounded-lg border border-stone-200 bg-stone-50 p-2 pr-8 text-xs text-stone-700"
        >
          <button
            type="button"
            className="absolute right-2 top-2 rounded-md p-1 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900"
            onClick={() => onRemove(stripe.id)}
            aria-label="Remove stripe"
          >
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
              className="lucide lucide-trash2-icon lucide-trash-2 h-4 w-4"
            >
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <p className="font-bold">
            {index + 1}. {stripe.orientation} stripe
          </p>
          <p>
            Position:{" "}
            {formatDisplayValue(
              pixelsToDisplayUnit(stripe.position, pixelsPerDisplayUnit),
              unit,
            )}{" "}
            {suffix}
          </p>
          <p>
            Width:{" "}
            {formatDisplayValue(
              pixelsToDisplayUnit(stripe.width, pixelsPerDisplayUnit),
              unit,
            )}{" "}
            {suffix}
          </p>
          {stripe.orientation === "vertical" ? (
            <p>Warp: {stripe.warpColor}</p>
          ) : (
            <p>Weft: {stripe.weftColor}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
