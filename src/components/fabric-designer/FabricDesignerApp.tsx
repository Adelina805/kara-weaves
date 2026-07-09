"use client";

import { useEffect, useRef } from "react";
import { downloadFabricPng, getTextilePixelsPerInch, resolveTextilePreset } from "@/lib/fabric";
import { useCanvasViewport } from "@/hooks/useCanvasViewport";
import { useFabricDesignState } from "@/hooks/useFabricDesignState";
import { useFabricRenderer } from "@/hooks/useFabricRenderer";
import { useStripeBrush } from "@/hooks/useStripeBrush";
import { useStripeDrag } from "@/hooks/useStripeDrag";
import { FabricCanvas, FabricControls } from "@/components/fabric-designer/FabricDesigner";

export function FabricDesignerApp() {
  const {
    design,
    activeStripeBrush,
    dispatch,
    placeStripe,
    removeStripe,
    moveStripe,
  } = useFabricDesignState();

  const textilePreset = resolveTextilePreset(design.textilePreset);
  const { canvasWidth, canvasHeight } = textilePreset;
  const pixelsPerInch = getTextilePixelsPerInch(textilePreset);

  const {
    containerRef,
    zoom,
    fitScale,
    panX,
    panY,
    zoomPercent,
    zoomIn,
    zoomOut,
    resetZoom,
    isPanning,
    isSpacePressed,
    isViewportGestureActive,
    handlePointerDown: handleViewportPointerDown,
    handlePanStart: handleViewportPanStart,
    handlePointerMove: handleViewportPointerMove,
    handlePointerUp: handleViewportPointerUp,
  } = useCanvasViewport({ canvasWidth, canvasHeight });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startDragFromHit,
  } = useStripeDrag({
    design,
    onMoveStripe: moveStripe,
    canvasRef,
    isGestureActive: isViewportGestureActive,
  });

  const {
    hoverPosition,
    handleCanvasPointerDown,
    handlePointerMove: handleBrushPointerMove,
    handlePointerUp: handleBrushPointerUp,
    handlePointerLeave: handleBrushPointerLeave,
  } = useStripeBrush({
    design,
    activeStripeBrush,
    placeStripe,
    canvasRef,
    isStripeDragging: isDragging,
    isPanning,
    isSpacePressed,
    onDeferredPanStart: handleViewportPanStart,
    onDeferredStripeDragStart: startDragFromHit,
  });

  useFabricRenderer(design, isDragging, canvasRef);

  useEffect(() => {
    resetZoom();
  }, [design.textilePreset, resetZoom]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    downloadFabricPng(canvas, design.weaveType);
  };

  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <aside className="flex max-h-[38vh] w-full shrink-0 flex-col overflow-hidden border-b border-stone-200 bg-white shadow-sm md:max-h-none md:w-[370px] md:border-b-0 md:border-r">
        <header className="shrink-0 border-b border-stone-200 px-4 py-4">
          <h1 className="text-lg font-bold tracking-[0.12em] text-stone-900">
            KARA WEAVES DESIGN WORKSPACE
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">
            Design custom woven textiles with real production constraints.
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FabricControls
            design={design}
            activeStripeBrush={activeStripeBrush}
            dispatch={dispatch}
            pixelsPerInch={pixelsPerInch}
            onRemoveStripe={removeStripe}
          />
        </div>
      </aside>
      <div className="min-h-0 min-w-0 flex-1">
        <FabricCanvas
          canvasRef={canvasRef}
          containerRef={containerRef}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          stripes={design.stripes}
          activeStripeBrush={activeStripeBrush}
          hoverPosition={hoverPosition}
          fitScale={fitScale}
          zoom={zoom}
          panX={panX}
          panY={panY}
          zoomPercent={zoomPercent}
          isDragging={isDragging}
          isPanning={isPanning}
          isSpacePressed={isSpacePressed}
          rulersEnabled={design.rulers.enabled}
          pixelsPerInch={pixelsPerInch}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          onRulersEnabledChange={(enabled) =>
            dispatch({ type: "SET_RULERS_ENABLED", enabled })
          }
          onDownload={handleDownload}
          onStripePointerDown={handlePointerDown}
          onStripePointerMove={handlePointerMove}
          onStripePointerUp={handlePointerUp}
          onCanvasPointerDown={handleCanvasPointerDown}
          onBrushPointerMove={handleBrushPointerMove}
          onBrushPointerUp={handleBrushPointerUp}
          onBrushPointerLeave={handleBrushPointerLeave}
          onViewportPointerDown={handleViewportPointerDown}
          onViewportPanStart={handleViewportPanStart}
          onViewportPointerMove={handleViewportPointerMove}
          onViewportPointerUp={handleViewportPointerUp}
        />
      </div>
    </div>
  );
}
