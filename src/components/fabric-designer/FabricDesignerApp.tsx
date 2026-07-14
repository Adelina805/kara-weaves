"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { downloadFabricPng, getPixelsPerDisplayUnit, getTextilePixelsPerCm, getTextilePixelsPerInch, resolveTextilePreset } from "@/lib/fabric";
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

  const [selectedStripeId, setSelectedStripeId] = useState<string | null>(null);
  const [isStripeWidthSliding, setIsStripeWidthSliding] = useState(false);

  const textilePreset = resolveTextilePreset(design.textilePreset);
  const { canvasWidth, canvasHeight } = textilePreset;
  const pixelsPerInch = getTextilePixelsPerInch(textilePreset);
  const pixelsPerCm = getTextilePixelsPerCm(textilePreset);
  const displayUnit = design.rulers.unit;
  const pixelsPerDisplayUnit = getPixelsPerDisplayUnit(textilePreset, displayUnit);

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

  const handleSelectStripe = useCallback((id: string) => {
    setSelectedStripeId((current) => (current === id ? null : id));
  }, []);

  const handleRemoveStripe = useCallback(
    (id: string) => {
      removeStripe(id);
      setSelectedStripeId((current) => (current === id ? null : current));
    },
    [removeStripe],
  );

  const {
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startDragFromHit,
  } = useStripeDrag({
    design,
    onMoveStripe: moveStripe,
    onStripeClick: handleSelectStripe,
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

  const handleCanvasPointerDownWithDeselect = useCallback(
    (event: React.PointerEvent, stripeHit: Parameters<typeof handleCanvasPointerDown>[1]) => {
      if (activeStripeBrush.orientation === null && stripeHit === null) {
        setSelectedStripeId(null);
      }
      handleCanvasPointerDown(event, stripeHit);
    },
    [activeStripeBrush.orientation, handleCanvasPointerDown],
  );

  useFabricRenderer(design, isDragging || isStripeWidthSliding, canvasRef);

  useEffect(() => {
    resetZoom();
  }, [design.textilePreset, resetZoom]);

  useEffect(() => {
    if (
      selectedStripeId !== null &&
      !design.stripes.some((stripe) => stripe.id === selectedStripeId)
    ) {
      setSelectedStripeId(null);
    }
  }, [design.stripes, selectedStripeId]);

  useEffect(() => {
    if (selectedStripeId === null) {
      return;
    }

    const stripe = design.stripes.find((entry) => entry.id === selectedStripeId);
    if (!stripe) {
      return;
    }

    dispatch({
      type: "SET_ACTIVE_STRIPE_COLOR",
      color: stripe.orientation === "vertical" ? stripe.warpColor : stripe.weftColor,
    });
    dispatch({ type: "SET_ACTIVE_STRIPE_WIDTH", value: stripe.width });
    // Sync brush from stripe only when selection changes, not on every stripe edit/drag.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- design.stripes read at selection time
  }, [selectedStripeId, dispatch]);

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
            pixelsPerDisplayUnit={pixelsPerDisplayUnit}
            unit={displayUnit}
            selectedStripeId={selectedStripeId}
            onSelectStripe={handleSelectStripe}
            onUnitChange={(unit) => dispatch({ type: "SET_DISPLAY_UNIT", unit })}
            onRemoveStripe={handleRemoveStripe}
            onStripeWidthSlideStart={() => setIsStripeWidthSliding(true)}
            onStripeWidthSlideEnd={() => setIsStripeWidthSliding(false)}
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
          selectedStripeId={selectedStripeId}
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
          pixelsPerCm={pixelsPerCm}
          unit={displayUnit}
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
          onCanvasPointerDown={handleCanvasPointerDownWithDeselect}
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
