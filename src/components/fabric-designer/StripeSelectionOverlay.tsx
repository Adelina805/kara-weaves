import type { Stripe } from "@/lib/fabric";

type StripeSelectionOverlayProps = {
  stripe: Stripe | null;
  canvasWidth: number;
  canvasHeight: number;
};

export function StripeSelectionOverlay({
  stripe,
  canvasWidth,
  canvasHeight,
}: StripeSelectionOverlayProps) {
  if (!stripe) {
    return null;
  }

  const style =
    stripe.orientation === "vertical"
      ? {
          left: `${(stripe.position / canvasWidth) * 100}%`,
          width: `${(stripe.width / canvasWidth) * 100}%`,
          top: 0,
          height: "100%",
        }
      : {
          top: `${(stripe.position / canvasHeight) * 100}%`,
          height: `${(stripe.width / canvasHeight) * 100}%`,
          left: 0,
          width: "100%",
        };

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute marching-ants-box"
      style={style}
    />
  );
}
