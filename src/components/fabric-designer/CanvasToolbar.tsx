"use client";

type CanvasToolbarProps = {
  zoomPercent: string;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  rulersEnabled: boolean;
  onRulersEnabledChange: (enabled: boolean) => void;
  onDownload: () => void;
};

const toolbarButtonClass =
  "flex h-7 w-full items-center justify-center rounded-none text-stone-700 transition-colors hover:bg-stone-100";

export function CanvasToolbar({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  rulersEnabled,
  onRulersEnabledChange,
  onDownload,
}: CanvasToolbarProps) {
  return (
    <div
      className="absolute bottom-4 right-4 z-10 flex w-10 flex-col overflow-hidden rounded-md border border-stone-200 bg-white/95 shadow-sm backdrop-blur-sm"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        role="switch"
        aria-checked={rulersEnabled}
        aria-label="Toggle rulers"
        className={[
          toolbarButtonClass,
          "border-b border-stone-200",
          rulersEnabled ? "bg-stone-100 text-stone-900" : "text-stone-400",
        ].join(" ")}
        onClick={() => onRulersEnabledChange(!rulersEnabled)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-ruler-icon lucide-ruler h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
          <path d="m14.5 12.5 2-2" />
          <path d="m11.5 9.5 2-2" />
          <path d="m8.5 6.5 2-2" />
          <path d="m17.5 15.5 2-2" />
        </svg>
      </button>

      <div className="flex flex-col border-b border-stone-200 p-0.5">
        <button
          type="button"
          aria-label="Zoom in"
          className={`${toolbarButtonClass} text-base font-medium`}
          onClick={onZoomIn}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Reset zoom"
          className={`${toolbarButtonClass} text-[10px] font-semibold text-stone-600`}
          onClick={onResetZoom}
        >
          {zoomPercent}
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          className={`${toolbarButtonClass} text-base font-medium`}
          onClick={onZoomOut}
        >
          −
        </button>
      </div>

      <button
        type="button"
        aria-label="Download PNG"
        className={`${toolbarButtonClass} py-1.5`}
        onClick={onDownload}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-download-icon lucide-download h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M12 15V3" />
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
    </div>
  );
}
