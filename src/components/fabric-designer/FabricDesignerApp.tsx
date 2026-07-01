"use client";

import { downloadFabricPng } from "@/lib/fabric";
import { useFabricDesignState } from "@/hooks/useFabricDesignState";
import { useFabricRenderer } from "@/hooks/useFabricRenderer";
import { useStripeDrag } from "@/hooks/useStripeDrag";
import { FabricCanvas, FabricControls } from "@/components/fabric-designer/FabricDesigner";

export function FabricDesignerApp() {
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
    <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[370px_minmax(420px,1fr)]">
      <FabricControls
        design={design}
        newStripe={newStripe}
        dispatch={dispatch}
        onAddVerticalStripe={() => addStripe("vertical")}
        onAddHorizontalStripe={() => addStripe("horizontal")}
        onRemoveStripe={removeStripe}
        onRefresh={renderNow}
        onDownload={handleDownload}
      />
      <FabricCanvas
        canvasRef={canvasRef}
        outputSize={design.outputSize}
        isDragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}
