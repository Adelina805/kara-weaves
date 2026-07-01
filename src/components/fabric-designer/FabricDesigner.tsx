"use client";

import type { RefObject } from "react";
import type { FabricDesign, NewStripeDraft } from "@/lib/fabric";
import type { FabricDesignDispatch } from "@/hooks/useFabricDesignState";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Section";
import { BorderControls } from "./controls/BorderControls";
import {
  BodyColorControls,
  PatternTypeSelect,
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
    <Panel
      title="Fabric Controls"
      subtitle="Texture amount, softness, and intersection darkness use standard internal defaults."
      className="max-h-[78vh] overflow-y-auto"
    >
      <PatternTypeSelect weaveType={design.weaveType} dispatch={dispatch} />
      <BodyColorControls body={design.body} dispatch={dispatch} />
      <BorderControls borders={design.borders} dispatch={dispatch} />
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
    </Panel>
  );
}

type FabricCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  outputSize: number;
  isDragging: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLCanvasElement>) => void;
};

export function FabricCanvas({
  canvasRef,
  outputSize,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: FabricCanvasProps) {
  return (
    <Panel
      title="Preview"
      subtitle="Use Pattern Type to switch between plain, waffle, and loose weave."
    >
      <canvas
        ref={canvasRef}
        width={outputSize}
        height={outputSize}
        className={[
          "mt-3 w-full max-w-[900px] rounded-xl border border-stone-200 bg-white touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        ].join(" ")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
    </Panel>
  );
}
