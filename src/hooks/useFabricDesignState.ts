"use client";

import { useCallback, useReducer } from "react";
import {
  DEFAULT_FABRIC_DESIGN,
  DEFAULT_NEW_STRIPE,
  resolveTextilePreset,
  type FabricDesign,
  type NewStripeDraft,
  type Stripe,
  type StripeOrientation,
  type TextilePresetId,
} from "@/lib/fabric";

type FabricDesignAction =
  | { type: "SET_TEXTILE_PRESET"; textilePreset: TextilePresetId }
  | { type: "SET_BODY_WARP_COLOR"; color: string }
  | { type: "SET_BODY_WEFT_COLOR"; color: string }
  | { type: "SET_WARP_THICKNESS"; value: number }
  | { type: "SET_WEFT_THICKNESS"; value: number }
  | { type: "SET_LOOSE_OPENNESS"; value: number }
  | { type: "SET_LOOSE_IRREGULARITY"; value: number }
  | { type: "SET_LOOSE_THREAD_OPACITY"; value: number }
  | { type: "SET_WAFFLE_CELL_SCALE"; value: number }
  | { type: "SET_WAFFLE_DEPTH"; value: number }
  | { type: "SET_RULERS_ENABLED"; enabled: boolean }
  | { type: "SET_PIXELS_PER_CM"; value: number }
  | { type: "SET_NEW_STRIPE_WIDTH"; value: number }
  | { type: "SET_NEW_STRIPE_COLOR"; color: string }
  | { type: "ADD_STRIPE"; orientation: StripeOrientation }
  | { type: "REMOVE_STRIPE"; id: string }
  | { type: "MOVE_STRIPE"; id: string; position: number }
  | { type: "RESET_DESIGN" };

function createStripeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function fabricDesignReducer(
  state: { design: FabricDesign; newStripe: NewStripeDraft },
  action: FabricDesignAction,
): { design: FabricDesign; newStripe: NewStripeDraft } {
  switch (action.type) {
    case "SET_TEXTILE_PRESET": {
      const resolved = resolveTextilePreset(action.textilePreset);
      return {
        ...state,
        design: {
          ...state.design,
          textilePreset: resolved.textilePreset,
          weaveType: resolved.weaveType,
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
    case "SET_WARP_THICKNESS":
      return {
        ...state,
        design: {
          ...state.design,
          weave: { ...state.design.weave, warpThickness: action.value },
        },
      };
    case "SET_WEFT_THICKNESS":
      return {
        ...state,
        design: {
          ...state.design,
          weave: { ...state.design.weave, weftThickness: action.value },
        },
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
    case "SET_PIXELS_PER_CM":
      return {
        ...state,
        design: {
          ...state.design,
          rulers: { ...state.design.rulers, pixelsPerCm: action.value },
        },
      };
    case "SET_NEW_STRIPE_WIDTH":
      return {
        ...state,
        newStripe: { ...state.newStripe, width: action.value },
      };
    case "SET_NEW_STRIPE_COLOR":
      return {
        ...state,
        newStripe: { ...state.newStripe, color: action.color },
      };
    case "ADD_STRIPE": {
      const { canvasWidth, canvasHeight } = resolveTextilePreset(state.design.textilePreset);
      const isVertical = action.orientation === "vertical";
      const stripe: Stripe = {
        id: createStripeId(),
        orientation: action.orientation,
        position: Math.floor(
          (isVertical ? canvasWidth : canvasHeight) * 0.35,
        ),
        width: state.newStripe.width,
        warpColor: isVertical ? state.newStripe.color : state.design.body.warpColor,
        weftColor: isVertical ? state.design.body.weftColor : state.newStripe.color,
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
    case "RESET_DESIGN":
      return {
        design: DEFAULT_FABRIC_DESIGN,
        newStripe: DEFAULT_NEW_STRIPE,
      };
    default:
      return state;
  }
}

const initialState = {
  design: DEFAULT_FABRIC_DESIGN,
  newStripe: DEFAULT_NEW_STRIPE,
};

export function useFabricDesignState() {
  const [state, dispatch] = useReducer(fabricDesignReducer, initialState);

  const addStripe = useCallback((orientation: StripeOrientation) => {
    dispatch({ type: "ADD_STRIPE", orientation });
  }, []);

  const removeStripe = useCallback((id: string) => {
    dispatch({ type: "REMOVE_STRIPE", id });
  }, []);

  const moveStripe = useCallback((id: string, position: number) => {
    dispatch({ type: "MOVE_STRIPE", id, position });
  }, []);

  return {
    design: state.design,
    newStripe: state.newStripe,
    dispatch,
    addStripe,
    removeStripe,
    moveStripe,
  };
}

export type FabricDesignDispatch = ReturnType<typeof useFabricDesignState>["dispatch"];
