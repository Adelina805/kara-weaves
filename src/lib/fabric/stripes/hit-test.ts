import type { Stripe } from "../types";

export type StripeHit = {
  stripe: Stripe;
  offset: number;
};

export function findStripeAtPoint(
  stripes: Stripe[],
  x: number,
  y: number,
): StripeHit | null {
  for (let i = stripes.length - 1; i >= 0; i--) {
    const stripe = stripes[i];

    if (stripe.orientation === "vertical") {
      if (x >= stripe.position && x <= stripe.position + stripe.width) {
        return { stripe, offset: x - stripe.position };
      }
    } else if (y >= stripe.position && y <= stripe.position + stripe.width) {
      return { stripe, offset: y - stripe.position };
    }
  }

  return null;
}
