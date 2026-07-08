"use client";

import type { RefObject } from "react";
import type { FabricDesign, NewStripeDraft } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Button } from "@/components/ui/Button";
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
  onRefresh: () => void;
  onDownload: () => void;
};

export function FabricControls({
  design,
  newStripe,
  dispatch,
  onAddVerticalStripe,
  onAddHorizontalStripe,
  onRemoveStripe,
  onRefresh,
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

      <Button fullWidth className="mt-4" onClick={onRefresh}>
        Generate / Refresh
      </Button>
      <Button fullWidth variant="secondary" className="mt-2" onClick={onDownload}>
        Download PNG
      </Button>
    </div>
  );
}

type FabricCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  canvasWidth: number;
  canvasHeight: number;
  isDragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
};

export function FabricCanvas({
  canvasRef,
  canvasWidth,
  canvasHeight,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FabricCanvasProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-stone-100">
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={[
            "max-h-full max-w-full border border-stone-200 bg-white shadow-sm touch-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          ].join(" ")}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>
    </div>
  );
}
