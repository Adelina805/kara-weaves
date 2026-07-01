export function addFiberNoise(
  ctx: CanvasRenderingContext2D,
  tileWidth: number,
  tileHeight: number,
  cellWidth: number,
  cellHeight: number,
  textureAmount: number,
): void {
  const slubCount = Math.floor(20 + textureAmount * 90);

  for (let i = 0; i < slubCount; i++) {
    const x = Math.random() * tileWidth;
    const y = Math.random() * tileHeight;

    ctx.globalAlpha = Math.random() * 0.14;
    ctx.fillStyle = Math.random() > 0.45 ? "white" : "black";

    const dotSize = Math.random() > 0.85 ? 2 : 1;
    ctx.fillRect(x, y, dotSize, dotSize);
  }

  const fiberCount = Math.floor(20 + textureAmount * 70);

  for (let i = 0; i < fiberCount; i++) {
    const horizontal = Math.random() > 0.5;

    ctx.globalAlpha = Math.random() * 0.07;
    ctx.strokeStyle = Math.random() > 0.5 ? "white" : "black";
    ctx.lineWidth = 1;
    ctx.beginPath();

    if (horizontal) {
      const y = Math.random() * tileHeight;
      const x1 = Math.random() * tileWidth;
      const x2 = x1 + Math.random() * cellWidth * 4;
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y + (Math.random() - 0.5) * 1.5);
    } else {
      const x = Math.random() * tileWidth;
      const y1 = Math.random() * tileHeight;
      const y2 = y1 + Math.random() * cellHeight * 4;
      ctx.moveTo(x, y1);
      ctx.lineTo(x + (Math.random() - 0.5) * 1.5, y2);
    }

    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
