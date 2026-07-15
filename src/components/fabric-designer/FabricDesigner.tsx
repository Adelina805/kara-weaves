"use client";

import type { RefObject } from "react";
import type { ActiveStripeBrush, FabricDesign, Stripe, StripeHit, RulerUnit } from "@/lib/fabric";
import { findStripeAtPoint, getCanvasPointerPosition } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { CanvasToolbar } from "./CanvasToolbar";
import { FabricRulers } from "./FabricRulers";
import { StripeBrushPreview } from "./StripeBrushPreview";
import { StripeSelectionOverlay } from "./StripeSelectionOverlay";
import {
  BodyColorControls,
  FabricSizeSelect,
} from "./controls/PatternAndBodyControls";
import { StripeControls } from "./controls/StripeControls";

type FabricControlsProps = {
  design: FabricDesign;
  activeStripeBrush: ActiveStripeBrush;
  dispatch: FabricDesignDispatch;
  pixelsPerDisplayUnit: number;
  unit: RulerUnit;
  selectedStripeId: string | null;
  onSelectStripe: (id: string) => void;
  onUnitChange: (unit: RulerUnit) => void;
  onRemoveStripe: (id: string) => void;
  onStripeWidthSlideStart?: () => void;
  onStripeWidthSlideEnd?: () => void;
};

export function FabricControls({
  design,
  activeStripeBrush,
  dispatch,
  pixelsPerDisplayUnit,
  unit,
  selectedStripeId,
  onSelectStripe,
  onUnitChange,
  onRemoveStripe,
  onStripeWidthSlideStart,
  onStripeWidthSlideEnd,
}: FabricControlsProps) {
  return (
    <div className="p-4">
      <FabricSizeSelect
        design={design}
        dispatch={dispatch}
        unit={unit}
        onUnitChange={onUnitChange}
      />
      <BodyColorControls body={design.body} dispatch={dispatch} />
      <StripeControls
        stripes={design.stripes}
        activeStripeBrush={activeStripeBrush}
        dispatch={dispatch}
        pixelsPerDisplayUnit={pixelsPerDisplayUnit}
        unit={unit}
        selectedStripeId={selectedStripeId}
        onSelectStripe={onSelectStripe}
        onRemoveStripe={onRemoveStripe}
        onStripeWidthSlideStart={onStripeWidthSlideStart}
        onStripeWidthSlideEnd={onStripeWidthSlideEnd}
      />
    </div>
  );
}

type FabricCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  stripes: Stripe[];
  selectedStripeId: string | null;
  activeStripeBrush: ActiveStripeBrush;
  hoverPosition: { x: number; y: number } | null;
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
  pixelsPerCm: number;
  unit: RulerUnit;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onRulersEnabledChange: (enabled: boolean) => void;
  onDownload: () => void;
  onStripePointerDown: (event: React.PointerEvent) => void;
  onStripePointerMove: (event: React.PointerEvent) => void;
  onStripePointerUp: (event: React.PointerEvent) => void;
  onCanvasPointerDown: (event: React.PointerEvent, stripeHit: StripeHit | null) => void;
  onBrushPointerMove: (event: React.PointerEvent) => void;
  onBrushPointerUp: (event: React.PointerEvent) => void;
  onBrushPointerLeave: () => void;
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
  selectedStripeId,
  activeStripeBrush,
  hoverPosition,
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
  pixelsPerCm,
  unit,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onRulersEnabledChange,
  onDownload,
  onStripePointerDown,
  onStripePointerMove,
  onStripePointerUp,
  onCanvasPointerDown,
  onBrushPointerMove,
  onBrushPointerUp,
  onBrushPointerLeave,
  onViewportPointerDown,
  onViewportPanStart,
  onViewportPointerMove,
  onViewportPointerUp,
}: FabricCanvasProps) {
  const displayWidth = canvasWidth * fitScale * zoom;
  const displayHeight = canvasHeight * fitScale * zoom;

  const selectedStripe =
    selectedStripeId === null
      ? null
      : stripes.find((stripe) => stripe.id === selectedStripeId) ?? null;

  const cursorClass = isPanning || isDragging
    ? "cursor-grabbing"
    : isSpacePressed
      ? "cursor-grab"
      : activeStripeBrush.orientation !== null
        ? "cursor-crosshair"
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
      const brushActive = activeStripeBrush.orientation !== null;

      if (brushActive) {
        onCanvasPointerDown(event, hit);
        return;
      }

      if (hit) {
        onStripePointerDown(event);
        return;
      }

      onCanvasPointerDown(event, null);
      return;
    }

    onViewportPanStart(event);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const isViewportGesture = onViewportPointerMove(event);
    onBrushPointerMove(event);
    if (!isViewportGesture) {
      onStripePointerMove(event);
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    onViewportPointerUp(event);
    onBrushPointerUp(event);
    onStripePointerUp(event);
  };

  const handlePointerLeave = () => {
    onBrushPointerLeave();
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-stone-100">
      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden p-3 md:p-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        <div
          className="absolute"
          style={{
            left: panX,
            top: panY,
          }}
        >
          <div className="relative">
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
              onPointerLeave={handlePointerLeave}
            />
            <StripeBrushPreview
              activeStripeBrush={activeStripeBrush}
              hoverPosition={hoverPosition}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
            <StripeSelectionOverlay
              stripe={selectedStripe}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </div>
        </div>
        <FabricRulers
          enabled={rulersEnabled}
          panX={panX}
          panY={panY}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          pixelsPerInch={pixelsPerInch}
          pixelsPerCm={pixelsPerCm}
          fitScale={fitScale}
          zoom={zoom}
          unit={unit}
        />
        <CanvasToolbar
          zoomPercent={zoomPercent}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetZoom={onResetZoom}
          rulersEnabled={rulersEnabled}
          onRulersEnabledChange={onRulersEnabledChange}
          onDownload={onDownload}
        />
      </div>
    </div>
  );
}
