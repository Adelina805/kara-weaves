export function fillPatternRect(
  ctx: CanvasRenderingContext2D,
  pattern: CanvasPattern | null,
  rect: { x: number; y: number; w: number; h: number },
): void {
  if (!pattern) {
    return;
  }

  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.restore();
}
