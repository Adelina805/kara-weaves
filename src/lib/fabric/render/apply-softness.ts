export function applyGlobalSoftness(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  softness: number,
): void {
  if (softness <= 0) {
    return;
  }

  const canvas = ctx.canvas;
  const temp = document.createElement("canvas");
  temp.width = width;
  temp.height = height;

  const tempCtx = temp.getContext("2d");
  if (!tempCtx) {
    return;
  }

  tempCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, width, height);
  ctx.filter = `blur(${Math.min(0.65, softness)}px)`;
  ctx.drawImage(temp, 0, 0);
  ctx.filter = "none";
}
