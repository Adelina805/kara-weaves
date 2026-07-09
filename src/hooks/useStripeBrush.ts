"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import {
  computeCenteredStripePosition,
  getCanvasPointerPosition,
  resolveTextilePreset,
  type ActiveStripeBrush,
  type FabricDesign,
  type StripeHit,
} from "@/lib/fabric";

const PLACEMENT_CLICK_THRESHOLD = 5;
const INTERACTION_DRAG_THRESHOLD = 8;

type PendingClick = {
  pointerId: number;
  clientX: number;
  clientY: number;
  canvasX: number;
  canvasY: number;
  stripeHit: StripeHit | null;
};

type UseStripeBrushOptions = {
  design: FabricDesign;
  activeStripeBrush: ActiveStripeBrush;
  placeStripe: (position: number) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  isStripeDragging: boolean;
  isPanning: boolean;
  isSpacePressed: boolean;
  onDeferredPanStart: (event: React.PointerEvent) => void;
  onDeferredStripeDragStart: (event: React.PointerEvent, hit: StripeHit) => void;
};

export function useStripeBrush({
  design,
  activeStripeBrush,
  placeStripe,
  canvasRef,
  isStripeDragging,
  isPanning,
  isSpacePressed,
  onDeferredPanStart,
  onDeferredStripeDragStart,
}: UseStripeBrushOptions) {
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const pendingClickRef = useRef<PendingClick | null>(null);
  const interactionStartedRef = useRef(false);

  const clearPendingClick = useCallback(() => {
    pendingClickRef.current = null;
    interactionStartedRef.current = false;
  }, []);

  const showPreview =
    activeStripeBrush.orientation !== null &&
    hoverPosition !== null &&
    !isStripeDragging &&
    !isPanning &&
    !isSpacePressed;

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent, stripeHit: StripeHit | null) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      pendingClickRef.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        canvasX: pos.x,
        canvasY: pos.y,
        stripeHit,
      };
      interactionStartedRef.current = false;
    },
    [canvasRef],
  );

  const updateHoverFromEvent = useCallback(
    (event: React.PointerEvent) => {
      if (isStripeDragging || isPanning || isSpacePressed) {
        setHoverPosition(null);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas?.contains(event.target as Node)) {
        setHoverPosition(null);
        return;
      }

      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      setHoverPosition(pos);
    },
    [canvasRef, isPanning, isSpacePressed, isStripeDragging],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const pending = pendingClickRef.current;
      if (
        pending &&
        pending.pointerId === event.pointerId &&
        !interactionStartedRef.current &&
        !isStripeDragging
      ) {
        const dx = event.clientX - pending.clientX;
        const dy = event.clientY - pending.clientY;
        const dragThreshold = pending.stripeHit
          ? INTERACTION_DRAG_THRESHOLD
          : PLACEMENT_CLICK_THRESHOLD;

        if (dx * dx + dy * dy >= dragThreshold * dragThreshold) {
          interactionStartedRef.current = true;
          if (pending.stripeHit) {
            onDeferredStripeDragStart(event, pending.stripeHit);
          } else {
            onDeferredPanStart(event);
          }
        }
      }

      updateHoverFromEvent(event);
    },
    [isStripeDragging, onDeferredPanStart, onDeferredStripeDragStart, updateHoverFromEvent],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const pending = pendingClickRef.current;
      if (
        pending &&
        pending.pointerId === event.pointerId &&
        !interactionStartedRef.current &&
        !isStripeDragging
      ) {
        const dx = event.clientX - pending.clientX;
        const dy = event.clientY - pending.clientY;
        if (dx * dx + dy * dy < PLACEMENT_CLICK_THRESHOLD * PLACEMENT_CLICK_THRESHOLD) {
          const { orientation, width } = activeStripeBrush;
          if (orientation !== null) {
            const { canvasWidth, canvasHeight } = resolveTextilePreset(design.textilePreset);
            const position =
              orientation === "vertical"
                ? computeCenteredStripePosition(pending.canvasX, width, canvasWidth)
                : computeCenteredStripePosition(pending.canvasY, width, canvasHeight);
            placeStripe(position);
          }
        }
      }

      clearPendingClick();
      updateHoverFromEvent(event);
    },
    [
      activeStripeBrush,
      clearPendingClick,
      design.textilePreset,
      isStripeDragging,
      placeStripe,
      updateHoverFromEvent,
    ],
  );

  const handlePointerLeave = useCallback(() => {
    setHoverPosition(null);
    clearPendingClick();
  }, [clearPendingClick]);

  return {
    hoverPosition: showPreview ? hoverPosition : null,
    handleCanvasPointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    clearPendingClick,
  };
}
