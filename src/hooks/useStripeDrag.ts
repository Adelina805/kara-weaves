"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  clampStripePosition,
  findStripeAtPoint,
  getCanvasPointerPosition,
  resolveTextilePreset,
  type FabricDesign,
  type Stripe,
  type StripeHit,
} from "@/lib/fabric";

const DRAG_THRESHOLD = 8;

type PendingDrag = {
  pointerId: number;
  clientX: number;
  clientY: number;
  stripeId: string;
  offset: number;
};

type UseStripeDragOptions = {
  design: FabricDesign;
  onMoveStripe: (id: string, position: number) => void;
  onStripeClick?: (id: string) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isGestureActive?: boolean;
};

export function useStripeDrag({
  design,
  onMoveStripe,
  onStripeClick,
  canvasRef,
  isGestureActive = false,
}: UseStripeDragOptions) {
  const [draggingStripeId, setDraggingStripeId] = useState<string | null>(null);
  const dragOffsetRef = useRef(0);
  const capturedPointerIdRef = useRef<number | null>(null);
  const pendingDragRef = useRef<PendingDrag | null>(null);

  const clearPendingDrag = useCallback(() => {
    pendingDragRef.current = null;
  }, []);

  const startDrag = useCallback(
    (event: React.PointerEvent, stripeId: string, offset: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      setDraggingStripeId(stripeId);
      dragOffsetRef.current = offset;
      capturedPointerIdRef.current = event.pointerId;
      pendingDragRef.current = null;
      canvas.setPointerCapture(event.pointerId);
    },
    [canvasRef],
  );

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
    pendingDragRef.current = null;
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

      pendingDragRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        stripeId: hit.stripe.id,
        offset: hit.offset,
      };
    },
    [canvasRef, design.stripes, isGestureActive],
  );

  const startDragFromHit = useCallback(
    (event: React.PointerEvent, hit: StripeHit) => {
      startDrag(event, hit.stripe.id, hit.offset);
    },
    [startDrag],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const pending = pendingDragRef.current;
      if (pending && draggingStripeId === null && pending.pointerId === event.pointerId) {
        const dx = event.clientX - pending.clientX;
        const dy = event.clientY - pending.clientY;
        if (dx * dx + dy * dy >= DRAG_THRESHOLD * DRAG_THRESHOLD) {
          startDrag(event, pending.stripeId, pending.offset);
        }
      }

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
    [
      canvasRef,
      design.stripes,
      design.textilePreset,
      draggingStripeId,
      isGestureActive,
      onMoveStripe,
      startDrag,
    ],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const pending = pendingDragRef.current;
      const wasDragging = draggingStripeId !== null;
      const canvas = canvasRef.current;

      if (wasDragging && capturedPointerIdRef.current === event.pointerId && canvas) {
        canvas.releasePointerCapture(event.pointerId);
      }

      if (
        !wasDragging &&
        pending &&
        pending.pointerId === event.pointerId &&
        onStripeClick
      ) {
        const dx = event.clientX - pending.clientX;
        const dy = event.clientY - pending.clientY;
        if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) {
          onStripeClick(pending.stripeId);
        }
      }

      setDraggingStripeId(null);
      dragOffsetRef.current = 0;
      capturedPointerIdRef.current = null;
      pendingDragRef.current = null;
    },
    [canvasRef, draggingStripeId, onStripeClick],
  );

  const isDragging = draggingStripeId !== null;

  return {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startDragFromHit,
    clearPendingDrag,
  };
}

export type { Stripe };
