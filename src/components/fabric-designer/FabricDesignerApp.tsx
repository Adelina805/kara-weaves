"use client";

import type { ReactNode } from "react";
import { downloadFabricPng, type FabricDesign } from "@/lib/fabric";
import { useFabricDesignState } from "@/hooks/useFabricDesignState";
import { useFabricRenderer } from "@/hooks/useFabricRenderer";
import { useStripeDrag } from "@/hooks/useStripeDrag";
import { FabricCanvas, FabricControls } from "@/components/fabric-designer/FabricDesigner";

export function FabricDesignerApp({
  workflowControls,
  workflowOverlay,
}: {
  workflowControls?: (design: FabricDesign) => ReactNode;
  workflowOverlay?: (design: FabricDesign) => ReactNode;
} = {}) {
  const {
    design,
    newStripe,
    dispatch,
    addStripe,
    removeStripe,
    moveStripe,
  } = useFabricDesignState();

  const { isDragging, handlePointerDown, handlePointerMove, handlePointerUp } = useStripeDrag({
    design,
    onMoveStripe: moveStripe,
  });

  const { canvasRef, renderNow } = useFabricRenderer(design, isDragging);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    downloadFabricPng(canvas, design.weaveType);
  };

  return (
    <div className="flex h-full w-full">
      <aside className="flex w-[min(100%,370px)] shrink-0 flex-col border-r border-stone-200 bg-white shadow-sm">
        <header className="shrink-0 border-b border-stone-200 px-4 py-4">
          <h1 className="text-sm font-bold tracking-[0.12em] text-stone-900">
            KARA WEAVES DESIGN WORKSPACE
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-stone-500">
            Configure weave patterns, colors, and stripes. Drag stripes directly on the
            preview to reposition them.
          </p>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <FabricControls
            design={design}
            newStripe={newStripe}
            dispatch={dispatch}
            onAddVerticalStripe={() => addStripe("vertical")}
            onAddHorizontalStripe={() => addStripe("horizontal")}
            onRemoveStripe={removeStripe}
            onRefresh={renderNow}
            onDownload={handleDownload}
            workflowControls={workflowControls ? workflowControls(design) : null}
          />
        </div>
      </aside>
      <div className="relative min-h-0 min-w-0 flex-1">
        <FabricCanvas
          canvasRef={canvasRef}
          outputSize={design.outputSize}
          isDragging={isDragging}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        {workflowOverlay ? workflowOverlay(design) : null}
      </div>
    </div>
  );
}
