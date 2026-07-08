"use client";

import { useCallback, useRef, useState } from "react";
import {
  clampStripePosition,
  findStripeAtPoint,
  getCanvasPointerPosition,
  resolveTextilePreset,
  type FabricDesign,
  type Stripe,
} from "@/lib/fabric";

type UseStripeDragOptions = {
  design: FabricDesign;
  onMoveStripe: (id: string, position: number) => void;
};

export function useStripeDrag({ design, onMoveStripe }: UseStripeDragOptions) {
  const [draggingStripeId, setDraggingStripeId] = useState<string | null>(null);
  const dragOffsetRef = useRef(0);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = event.currentTarget;
      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      const hit = findStripeAtPoint(design.stripes, pos.x, pos.y);

      if (!hit) {
        return;
      }

      setDraggingStripeId(hit.stripe.id);
      dragOffsetRef.current = hit.offset;
      canvas.setPointerCapture(event.pointerId);
    },
    [design.stripes],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (draggingStripeId === null) {
        return;
      }

      const canvas = event.currentTarget;
      const stripe = design.stripes.find((s) => s.id === draggingStripeId);
      if (!stripe) {
        return;
      }

      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      const { canvasWidth, canvasHeight } = resolveTextilePreset(design.textilePreset);
      const canvasSize = stripe.orientation === "vertical" ? canvasWidth : canvasHeight;

      const nextPosition = clampStripePosition(
        (stripe.orientation === "vertical" ? pos.x : pos.y) - dragOffsetRef.current,
        stripe.width,
        canvasSize,
      );

      onMoveStripe(stripe.id, nextPosition);
    },
    [design.stripes, design.textilePreset, draggingStripeId, onMoveStripe],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingStripeId !== null) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggingStripeId(null);
    dragOffsetRef.current = 0;
  }, [draggingStripeId]);

  const isDragging = draggingStripeId !== null;

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { Stripe };
