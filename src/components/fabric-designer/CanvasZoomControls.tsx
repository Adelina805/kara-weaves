"use client";

type CanvasZoomControlsProps = {
  zoomPercent: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
};

export function CanvasZoomControls({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: CanvasZoomControlsProps) {
  return (
    <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-stone-200 bg-white/95 p-1 shadow-sm backdrop-blur-sm">
      <button
        type="button"
        aria-label="Zoom out"
        className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-medium text-stone-700 transition-colors hover:bg-stone-100"
        onClick={onZoomOut}
      >
        −
      </button>
      <button
        type="button"
        aria-label="Reset zoom"
        className="min-w-[3.25rem] rounded-md px-2 py-1 text-xs font-semibold text-stone-600 transition-colors hover:bg-stone-100"
        onClick={onResetZoom}
      >
        {zoomPercent}
      </button>
      <button
        type="button"
        aria-label="Zoom in"
        className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-medium text-stone-700 transition-colors hover:bg-stone-100"
        onClick={onZoomIn}
      >
        +
      </button>
    </div>
  );
}
