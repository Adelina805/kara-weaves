import type { ActiveStripeBrush } from "@/lib/fabric";

type StripeBrushPreviewProps = {
  activeStripeBrush: ActiveStripeBrush;
  hoverPosition: { x: number; y: number } | null;
  canvasWidth: number;
  canvasHeight: number;
};

export function StripeBrushPreview({
  activeStripeBrush,
  hoverPosition,
  canvasWidth,
  canvasHeight,
}: StripeBrushPreviewProps) {
  if (!hoverPosition || activeStripeBrush.orientation === null) {
    return null;
  }

  const { orientation, width, color } = activeStripeBrush;
  const opacity = 0.3;

  if (orientation === "horizontal") {
    const top = ((hoverPosition.y - width / 2) / canvasHeight) * 100;
    const height = (width / canvasHeight) * 100;

    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          top: `${top}%`,
          height: `${height}%`,
          backgroundColor: color,
          opacity,
        }}
      />
    );
  }

  const left = ((hoverPosition.x - width / 2) / canvasWidth) * 100;
  const bandWidth = (width / canvasWidth) * 100;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        left: `${left}%`,
        width: `${bandWidth}%`,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}
