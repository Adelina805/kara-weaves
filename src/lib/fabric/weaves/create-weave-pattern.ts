import type { WeavePatternParams } from "../types";
import { createDobbTexturePattern } from "./dobb-texture";
import { createLooseWeavePattern } from "./loose-weave";
import { createPlainWeavePattern } from "./plain-weave";
import { createThorthuCottonPattern } from "./thorthu-cotton";
import { createWaffleWeavePattern } from "./waffle-weave";

export function createWeavePattern(
  ctx: CanvasRenderingContext2D,
  params: WeavePatternParams,
): CanvasPattern | null {
  const {
    weaveType,
    warpColor,
    weftColor,
    warpThickness,
    weftThickness,
    textureAmount,
    loose,
    waffle,
  } = params;

  switch (weaveType) {
    case "waffle":
      return createWaffleWeavePattern(
        ctx,
        warpColor,
        weftColor,
        warpThickness,
        weftThickness,
        textureAmount,
        waffle,
      );
    case "loose":
      return createLooseWeavePattern(
        ctx,
        warpColor,
        weftColor,
        warpThickness,
        weftThickness,
        textureAmount,
        loose,
      );
    case "thorthu":
      return createThorthuCottonPattern(
        ctx,
        warpColor,
        weftColor,
        warpThickness,
        weftThickness,
        textureAmount,
      );
    case "dobb":
      return createDobbTexturePattern(
        ctx,
        warpColor,
        weftColor,
        warpThickness,
        weftThickness,
        textureAmount,
      );
    case "plain":
    default:
      return createPlainWeavePattern(
        ctx,
        warpColor,
        weftColor,
        warpThickness,
        weftThickness,
        textureAmount,
      );
  }
}
