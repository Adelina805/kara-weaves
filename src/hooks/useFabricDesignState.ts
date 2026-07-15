"use client";

import { useCallback, useReducer } from "react";
import {
  clampStripePosition,
  DEFAULT_ACTIVE_STRIPE_BRUSH,
  DEFAULT_FABRIC_DESIGN,
  getStripeWidthLimitsPx,
  getTextilePixelsPerInch,
  resolveTextilePreset,
  type ActiveStripeBrush,
  type FabricDesign,
  type ResolvedTextilePreset,
  type Stripe,
  type StripeOrientation,
  type TextilePresetId,
  type RulerUnit,
} from "@/lib/fabric";

type FabricDesignAction =
  | { type: "SET_TEXTILE_PRESET"; textilePreset: TextilePresetId }
  | { type: "SET_BODY_WARP_COLOR"; color: string }
  | { type: "SET_BODY_WEFT_COLOR"; color: string }
  | { type: "SET_LOOSE_OPENNESS"; value: number }
  | { type: "SET_LOOSE_IRREGULARITY"; value: number }
  | { type: "SET_LOOSE_THREAD_OPACITY"; value: number }
  | { type: "SET_WAFFLE_CELL_SCALE"; value: number }
  | { type: "SET_WAFFLE_DEPTH"; value: number }
  | { type: "SET_RULERS_ENABLED"; enabled: boolean }
  | { type: "SET_DISPLAY_UNIT"; unit: RulerUnit }
  | { type: "SET_ACTIVE_STRIPE_WIDTH"; value: number }
  | { type: "SET_ACTIVE_STRIPE_COLOR"; color: string }
  | { type: "SET_ACTIVE_STRIPE_ORIENTATION"; orientation: StripeOrientation | null }
  | { type: "PLACE_STRIPE"; position: number }
  | { type: "REMOVE_STRIPE"; id: string }
  | { type: "MOVE_STRIPE"; id: string; position: number }
  | { type: "UPDATE_STRIPE"; id: string; width?: number; color?: string }
  | { type: "RESET_DESIGN" };

function createStripeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clampStripeWidth(width: number, textilePreset: TextilePresetId): number {
  const { min, max } = getStripeWidthLimitsPx(resolveTextilePreset(textilePreset));
  return Math.max(min, Math.min(max, width));
}

/** Keep physical inch size when canvas PPI changes between textile presets. */
function rescalePixelsForPreset(
  pixels: number,
  from: ResolvedTextilePreset,
  to: ResolvedTextilePreset,
): number {
  const fromPpi = getTextilePixelsPerInch(from);
  const toPpi = getTextilePixelsPerInch(to);
  return (pixels / fromPpi) * toPpi;
}

function fabricDesignReducer(
  state: { design: FabricDesign; activeStripeBrush: ActiveStripeBrush },
  action: FabricDesignAction,
): { design: FabricDesign; activeStripeBrush: ActiveStripeBrush } {
  switch (action.type) {
    case "SET_TEXTILE_PRESET": {
      const previous = resolveTextilePreset(state.design.textilePreset);
      const resolved = resolveTextilePreset(action.textilePreset);
      const width = clampStripeWidth(
        rescalePixelsForPreset(state.activeStripeBrush.width, previous, resolved),
        resolved.textilePreset,
      );

      return {
        ...state,
        design: {
          ...state.design,
          textilePreset: resolved.textilePreset,
          weaveType: resolved.weaveType,
          stripes: state.design.stripes.map((stripe) => {
            const nextWidth = clampStripeWidth(
              rescalePixelsForPreset(stripe.width, previous, resolved),
              resolved.textilePreset,
            );
            const canvasSize =
              stripe.orientation === "vertical" ? resolved.canvasWidth : resolved.canvasHeight;
            const nextPosition = clampStripePosition(
              rescalePixelsForPreset(stripe.position, previous, resolved),
              nextWidth,
              canvasSize,
            );
            return { ...stripe, width: nextWidth, position: nextPosition };
          }),
        },
        activeStripeBrush: {
          ...state.activeStripeBrush,
          width,
        },
      };
    }
    case "SET_BODY_WARP_COLOR":
      return {
        ...state,
        design: { ...state.design, body: { ...state.design.body, warpColor: action.color } },
      };
    case "SET_BODY_WEFT_COLOR":
      return {
        ...state,
        design: { ...state.design, body: { ...state.design.body, weftColor: action.color } },
      };
    case "SET_LOOSE_OPENNESS":
      return {
        ...state,
        design: {
          ...state.design,
          weave: {
            ...state.design.weave,
            loose: { ...state.design.weave.loose, openness: action.value },
          },
        },
      };
    case "SET_LOOSE_IRREGULARITY":
      return {
        ...state,
        design: {
          ...state.design,
          weave: {
            ...state.design.weave,
            loose: { ...state.design.weave.loose, irregularity: action.value },
          },
        },
      };
    case "SET_LOOSE_THREAD_OPACITY":
      return {
        ...state,
        design: {
          ...state.design,
          weave: {
            ...state.design.weave,
            loose: { ...state.design.weave.loose, threadOpacity: action.value },
          },
        },
      };
    case "SET_WAFFLE_CELL_SCALE":
      return {
        ...state,
        design: {
          ...state.design,
          weave: {
            ...state.design.weave,
            waffle: { ...state.design.weave.waffle, cellScale: action.value },
          },
        },
      };
    case "SET_WAFFLE_DEPTH":
      return {
        ...state,
        design: {
          ...state.design,
          weave: {
            ...state.design.weave,
            waffle: { ...state.design.weave.waffle, depth: action.value },
          },
        },
      };
    case "SET_RULERS_ENABLED":
      return {
        ...state,
        design: {
          ...state.design,
          rulers: { ...state.design.rulers, enabled: action.enabled },
        },
      };
    case "SET_DISPLAY_UNIT":
      return {
        ...state,
        design: {
          ...state.design,
          rulers: { ...state.design.rulers, unit: action.unit },
        },
      };
    case "SET_ACTIVE_STRIPE_WIDTH":
      return {
        ...state,
        activeStripeBrush: {
          ...state.activeStripeBrush,
          width: clampStripeWidth(action.value, state.design.textilePreset),
        },
      };
    case "SET_ACTIVE_STRIPE_COLOR":
      return {
        ...state,
        activeStripeBrush: { ...state.activeStripeBrush, color: action.color },
      };
    case "SET_ACTIVE_STRIPE_ORIENTATION":
      return {
        ...state,
        activeStripeBrush: { ...state.activeStripeBrush, orientation: action.orientation },
      };
    case "PLACE_STRIPE": {
      const { orientation, color } = state.activeStripeBrush;
      if (orientation === null) {
        return state;
      }
      const width = clampStripeWidth(
        state.activeStripeBrush.width,
        state.design.textilePreset,
      );
      const isVertical = orientation === "vertical";
      const stripe: Stripe = {
        id: createStripeId(),
        orientation,
        position: action.position,
        width,
        warpColor: isVertical ? color : state.design.body.warpColor,
        weftColor: isVertical ? state.design.body.weftColor : color,
      };
      return {
        ...state,
        design: {
          ...state.design,
          stripes: [...state.design.stripes, stripe],
        },
      };
    }
    case "REMOVE_STRIPE":
      return {
        ...state,
        design: {
          ...state.design,
          stripes: state.design.stripes.filter((stripe) => stripe.id !== action.id),
        },
      };
    case "MOVE_STRIPE":
      return {
        ...state,
        design: {
          ...state.design,
          stripes: state.design.stripes.map((stripe) =>
            stripe.id === action.id ? { ...stripe, position: action.position } : stripe,
          ),
        },
      };
    case "UPDATE_STRIPE": {
      const stripe = state.design.stripes.find((entry) => entry.id === action.id);
      if (!stripe) {
        return state;
      }

      const resolved = resolveTextilePreset(state.design.textilePreset);
      const { canvasWidth, canvasHeight } = resolved;
      const canvasSize = stripe.orientation === "vertical" ? canvasWidth : canvasHeight;
      let updated = { ...stripe };

      if (action.width !== undefined) {
        const { min, max } = getStripeWidthLimitsPx(resolved);
        const width = Math.max(min, Math.min(max, action.width));
        updated = {
          ...updated,
          width,
          position: clampStripePosition(updated.position, width, canvasSize),
        };
      }

      if (action.color !== undefined) {
        updated =
          stripe.orientation === "vertical"
            ? { ...updated, warpColor: action.color }
            : { ...updated, weftColor: action.color };
      }

      return {
        ...state,
        design: {
          ...state.design,
          stripes: state.design.stripes.map((entry) =>
            entry.id === action.id ? updated : entry,
          ),
        },
      };
    }
    case "RESET_DESIGN":
      return {
        design: DEFAULT_FABRIC_DESIGN,
        activeStripeBrush: DEFAULT_ACTIVE_STRIPE_BRUSH,
      };
    default:
      return state;
  }
}

const initialState = {
  design: DEFAULT_FABRIC_DESIGN,
  activeStripeBrush: DEFAULT_ACTIVE_STRIPE_BRUSH,
};

export function useFabricDesignState() {
  const [state, dispatch] = useReducer(fabricDesignReducer, initialState);

  const placeStripe = useCallback((position: number) => {
    dispatch({ type: "PLACE_STRIPE", position });
  }, []);

  const removeStripe = useCallback((id: string) => {
    dispatch({ type: "REMOVE_STRIPE", id });
  }, []);

  const moveStripe = useCallback((id: string, position: number) => {
    dispatch({ type: "MOVE_STRIPE", id, position });
  }, []);

  return {
    design: state.design,
    activeStripeBrush: state.activeStripeBrush,
    dispatch,
    placeStripe,
    removeStripe,
    moveStripe,
  };
}

export type FabricDesignDispatch = ReturnType<typeof useFabricDesignState>["dispatch"];
