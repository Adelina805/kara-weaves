import { darken, hexToRgb } from "../color";
import { FIXED_WARP_THICKNESS, FIXED_WEFT_THICKNESS } from "../defaults";
import { rectIntersection } from "../geometry";
import { resolveTextilePreset } from "../textile-presets";
import type {
  ColorBand,
  FabricDesign,
  RenderDefaults,
  RGB,
  WeavePatternParams,
} from "../types";
import { createWeavePattern } from "../weaves/create-weave-pattern";
import { applyGlobalSoftness } from "./apply-softness";
import { fillPatternRect } from "./fill-pattern";

function buildWeaveParams(
  design: FabricDesign,
  warpColor: RGB,
  weftColor: RGB,
  textureAmount: number,
): WeavePatternParams {
  return {
    weaveType: design.weaveType,
    warpColor,
    weftColor,
    warpThickness: FIXED_WARP_THICKNESS,
    weftThickness: FIXED_WEFT_THICKNESS,
    textureAmount,
    loose: design.weave.loose,
  };
}

function createPatternForColors(
  ctx: CanvasRenderingContext2D,
  design: FabricDesign,
  warpColor: RGB,
  weftColor: RGB,
  textureAmount: number,
): CanvasPattern | null {
  return createWeavePattern(ctx, buildWeaveParams(design, warpColor, weftColor, textureAmount));
}

export function renderFabric(
  canvas: HTMLCanvasElement,
  design: FabricDesign,
  defaults: RenderDefaults,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const { canvasWidth, canvasHeight } = resolveTextilePreset(design.textilePreset);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const width = canvasWidth;
  const height = canvasHeight;

  const { textureAmount, softness, intersectionDarkness } = defaults;

  const bodyWarp = hexToRgb(design.body.warpColor);
  const bodyWeft = hexToRgb(design.body.weftColor);

  ctx.clearRect(0, 0, width, height);

  const verticalBands: ColorBand[] = [];
  const horizontalBands: ColorBand[] = [];

  const bodyPattern = createPatternForColors(ctx, design, bodyWarp, bodyWeft, textureAmount);
  fillPatternRect(ctx, bodyPattern, { x: 0, y: 0, w: width, h: height });

  for (const stripe of design.stripes) {
    if (stripe.orientation === "vertical") {
      const stripeWarp = hexToRgb(stripe.warpColor);
      const stripePattern = createPatternForColors(
        ctx,
        design,
        stripeWarp,
        bodyWeft,
        textureAmount,
      );
      const rect = {
        x: stripe.position,
        y: 0,
        w: stripe.width,
        h: height,
      };
      fillPatternRect(ctx, stripePattern, rect);
      verticalBands.push({ rect, vertical: stripeWarp, horizontal: bodyWeft });
    } else {
      const stripeWeft = hexToRgb(stripe.weftColor);
      const stripePattern = createPatternForColors(
        ctx,
        design,
        bodyWarp,
        stripeWeft,
        textureAmount,
      );
      const rect = {
        x: 0,
        y: stripe.position,
        w: width,
        h: stripe.width,
      };
      fillPatternRect(ctx, stripePattern, rect);
      horizontalBands.push({ rect, vertical: bodyWarp, horizontal: stripeWeft });
    }
  }

  for (const vertical of verticalBands) {
    for (const horizontal of horizontalBands) {
      const intersection = rectIntersection(vertical.rect, horizontal.rect);

      if (intersection) {
        const interWarp = darken(vertical.vertical, intersectionDarkness * 0.16);
        const interWeft = darken(horizontal.horizontal, intersectionDarkness * 0.16);

        const interPattern = createPatternForColors(
          ctx,
          design,
          interWarp,
          interWeft,
          textureAmount,
        );

        fillPatternRect(ctx, interPattern, intersection);
      }
    }
  }

  applyGlobalSoftness(ctx, width, height, softness * 0.7);
}
