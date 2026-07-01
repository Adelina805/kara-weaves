export function downloadFabricPng(canvas: HTMLCanvasElement, weaveType: string): void {
  const link = document.createElement("a");
  link.download = `custom_${weaveType}_woven_fabric.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
