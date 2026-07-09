"use client";

import type { RefObject } from "react";
import type { FabricDesign, NewStripeDraft, Stripe } from "@/lib/fabric";
import { findStripeAtPoint, getCanvasPointerPosition } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Button } from "@/components/ui/Button";
import { CanvasZoomControls } from "./CanvasZoomControls";
import { FabricRulers } from "./FabricRulers";
import {
  BodyColorControls,
  FabricSizeSelect,
  WeaveOutputControls,
} from "./controls/PatternAndBodyControls";
import { StripeControls } from "./controls/StripeControls";
import {
  LooseWeaveControls,
  RulerControls,
  WaffleWeaveControls,
} from "./controls/WeaveSpecificControls";

type FabricControlsProps = {
  design: FabricDesign;
  newStripe: NewStripeDraft;
  dispatch: FabricDesignDispatch;
  onAddVerticalStripe: () => void;
  onAddHorizontalStripe: () => void;
  onRemoveStripe: (id: string) => void;
  onDownload: () => void;
};

export function FabricControls({
  design,
  newStripe,
  dispatch,
  onAddVerticalStripe,
  onAddHorizontalStripe,
  onRemoveStripe,
  onDownload,
}: FabricControlsProps) {
  return (
    <div className="p-4">
      <FabricSizeSelect design={design} dispatch={dispatch} />
      <BodyColorControls body={design.body} dispatch={dispatch} />
      <StripeControls
        stripes={design.stripes}
        newStripe={newStripe}
        dispatch={dispatch}
        onAddVertical={onAddVerticalStripe}
        onAddHorizontal={onAddHorizontalStripe}
        onRemoveStripe={onRemoveStripe}
      />
      <WeaveOutputControls design={design} dispatch={dispatch} />
      <LooseWeaveControls
        loose={design.weave.loose}
        dispatch={dispatch}
        visible={design.weaveType === "loose"}
      />
      <WaffleWeaveControls
        waffle={design.weave.waffle}
        dispatch={dispatch}
        visible={design.weaveType === "waffle"}
      />
      <RulerControls rulers={design.rulers} dispatch={dispatch} />

      <Button fullWidth variant="secondary" className="mt-2" onClick={onDownload}>
        Download PNG
      </Button>
    </div>
  );
}

type FabricCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  stripes: Stripe[];
  fitScale: number;
  zoom: number;
  panX: number;
  panY: number;
  zoomPercent: string;
  isDragging: boolean;
  isPanning: boolean;
  isSpacePressed: boolean;
  rulersEnabled: boolean;
  pixelsPerInch: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onPointerMove: (event: React.PointerEvent) => void;
  onPointerUp: (event: React.PointerEvent) => void;
  onViewportPointerDown: (event: React.PointerEvent) => boolean;
  onViewportPanStart: (event: React.PointerEvent) => void;
  onViewportPointerMove: (event: React.PointerEvent) => boolean;
  onViewportPointerUp: (event: React.PointerEvent) => void;
};

export function FabricCanvas({
  canvasRef,
  containerRef,
  canvasWidth,
  canvasHeight,
  stripes,
  fitScale,
  zoom,
  panX,
  panY,
  zoomPercent,
  isDragging,
  isPanning,
  isSpacePressed,
  rulersEnabled,
  pixelsPerInch,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onViewportPointerDown,
  onViewportPanStart,
  onViewportPointerMove,
  onViewportPointerUp,
}: FabricCanvasProps) {
  const displayWidth = canvasWidth * fitScale * zoom;
  const displayHeight = canvasHeight * fitScale * zoom;

  const cursorClass = isPanning || isDragging
    ? "cursor-grabbing"
    : isSpacePressed
      ? "cursor-grab"
      : "cursor-grab";

  const handlePointerDown = (event: React.PointerEvent) => {
    if (onViewportPointerDown(event)) {
      return;
    }

    if (event.button !== 0 || isSpacePressed) {
      return;
    }

    const canvas = canvasRef.current;
    if (canvas?.contains(event.target as Node)) {
      const pos = getCanvasPointerPosition(canvas, event.clientX, event.clientY);
      const hit = findStripeAtPoint(stripes, pos.x, pos.y);

      if (hit) {
        onPointerDown(event);
        return;
      }
    }

    onViewportPanStart(event);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const isViewportGesture = onViewportPointerMove(event);
    if (!isViewportGesture) {
      onPointerMove(event);
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    onViewportPointerUp(event);
    onPointerUp(event);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-stone-100">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden p-3 md:p-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          className="absolute"
          style={{
            left: panX,
            top: panY,
          }}
        >
          <FabricRulers
            enabled={rulersEnabled}
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            pixelsPerInch={pixelsPerInch}
            fitScale={fitScale}
            zoom={zoom}
          >
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className={[
                "border border-stone-200 bg-white shadow-sm touch-none",
                cursorClass,
              ].join(" ")}
              style={{ width: displayWidth, height: displayHeight }}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          </FabricRulers>
        </div>
      </div>
      <CanvasZoomControls
        zoomPercent={zoomPercent}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetZoom={onResetZoom}
      />
    </div>
  );
}
