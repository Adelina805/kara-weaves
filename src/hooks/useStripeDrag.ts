"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
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
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isGestureActive?: boolean;
};

export function useStripeDrag({
  design,
  onMoveStripe,
  canvasRef,
  isGestureActive = false,
}: UseStripeDragOptions) {
  const [draggingStripeId, setDraggingStripeId] = useState<string | null>(null);
  const dragOffsetRef = useRef(0);
  const capturedPointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isGestureActive || draggingStripeId === null) {
      return;
    }

    const canvas = canvasRef.current;
    const pointerId = capturedPointerIdRef.current;
    if (canvas && pointerId !== null) {
      canvas.releasePointerCapture(pointerId);
    }

    setDraggingStripeId(null);
    dragOffsetRef.current = 0;
    capturedPointerIdRef.current = null;
  }, [canvasRef, isGestureActive, draggingStripeId]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (isGestureActive) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      const hit = findStripeAtPoint(design.stripes, pos.x, pos.y);

      if (!hit) {
        return;
      }

      setDraggingStripeId(hit.stripe.id);
      dragOffsetRef.current = hit.offset;
      capturedPointerIdRef.current = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
    },
    [canvasRef, design.stripes, isGestureActive],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (draggingStripeId === null || isGestureActive) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
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
    [canvasRef, design.stripes, design.textilePreset, draggingStripeId, isGestureActive, onMoveStripe],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (draggingStripeId !== null && capturedPointerIdRef.current === event.pointerId && canvas) {
        canvas.releasePointerCapture(event.pointerId);
      }
      setDraggingStripeId(null);
      dragOffsetRef.current = 0;
      capturedPointerIdRef.current = null;
    },
    [canvasRef, draggingStripeId],
  );

  const isDragging = draggingStripeId !== null;

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}

export type { Stripe };
