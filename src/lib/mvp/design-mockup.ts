import { darken, hexToRgb, lighten, mix, rgbToString } from "@/lib/fabric/color";
import type { FabricDesign, Rect, RGB } from "@/lib/fabric";

function clampRect(rect: Rect, maxWidth: number, maxHeight: number): Rect | null {
  const x1 = Math.max(0, Math.min(maxWidth, rect.x));
  const y1 = Math.max(0, Math.min(maxHeight, rect.y));
  const x2 = Math.max(x1, Math.min(maxWidth, rect.x + rect.w));
  const y2 = Math.max(y1, Math.min(maxHeight, rect.y + rect.h));

  if (x2 <= x1 || y2 <= y1) {
    return null;
  }

  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function rectIntersection(a: Rect, b: Rect): Rect | null {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  if (x2 <= x1 || y2 <= y1) {
    return null;
  }

  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
}

function scaleRect(rect: Rect, designSize: number, width: number, height: number): Rect {
  return {
    x: (rect.x / designSize) * width,
    y: (rect.y / designSize) * height,
    w: (rect.w / designSize) * width,
    h: (rect.h / designSize) * height,
  };
}

function wovenFillColor(warp: RGB, weft: RGB, weaveType: FabricDesign["weaveType"]): RGB {
  if (weaveType === "loose") {
    return lighten(mix(warp, weft, 0.52), 0.08);
  }

  if (weaveType === "waffle") {
    return mix(lighten(warp, 0.06), darken(weft, 0.04), 0.52);
  }

  return mix(warp, weft, 0.5);
}

function rectSvg(rect: Rect, fill: string, opacity = 1) {
  return `<rect x="${rect.x.toFixed(2)}" y="${rect.y.toFixed(2)}" width="${rect.w.toFixed(2)}" height="${rect.h.toFixed(2)}" fill="${fill}" fill-opacity="${opacity}" />`;
}

function buildTextureOverlay(width: number, height: number, weaveType: FabricDesign["weaveType"], idSuffix: string) {
  if (weaveType === "loose") {
    return `
      <pattern id="looseGrid-${idSuffix}" width="18" height="18" patternUnits="userSpaceOnUse">
        <path d="M 0 5 C 4 4, 9 6, 18 5" stroke="#756f63" stroke-opacity="0.26" stroke-width="0.75" fill="none" />
        <path d="M 5 0 C 4 5, 6 10, 5 18" stroke="#756f63" stroke-opacity="0.24" stroke-width="0.75" fill="none" />
        <path d="M 0 12 L 18 12" stroke="#ffffff" stroke-opacity="0.20" stroke-width="0.55" />
        <path d="M 12 0 L 12 18" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.55" />
      </pattern>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#looseGrid-${idSuffix})" opacity="0.88" />
    `;
  }

  if (weaveType === "waffle") {
    return `
      <pattern id="waffleGrid-${idSuffix}" width="34" height="34" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="34" height="34" fill="none" />
        <path d="M 0 0 H 34 V 34 H 0 Z" fill="#ffffff" fill-opacity="0.08" />
        <path d="M 6 6 H 28 V 28 H 6 Z" fill="#000000" fill-opacity="0.08" />
        <path d="M 0 0 H 34 M 0 0 V 34" stroke="#ffffff" stroke-opacity="0.24" stroke-width="2" />
        <path d="M 34 0 V 34 M 0 34 H 34" stroke="#4f463a" stroke-opacity="0.16" stroke-width="2" />
      </pattern>
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#waffleGrid-${idSuffix})" opacity="0.75" />
    `;
  }

  return `
    <pattern id="plainGrid-${idSuffix}" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 0 0 H 10 M 0 0 V 10" stroke="#4a4035" stroke-opacity="0.15" stroke-width="0.7" />
      <path d="M 5 0 V 10 M 0 5 H 10" stroke="#ffffff" stroke-opacity="0.18" stroke-width="0.7" />
    </pattern>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#plainGrid-${idSuffix})" opacity="0.8" />
  `;
}

export function buildFabricDesignMockupSvg(
  design: FabricDesign,
  options: { width?: number; height?: number } = {},
) {
  const width = options.width ?? 520;
  const height = options.height ?? width;
  const designSize = design.outputSize;
  const idSuffix = `${design.weaveType}-${designSize}-${width}-${height}`.replace(/[^a-zA-Z0-9-]/g, "");

  const bodyWarp = hexToRgb(design.body.warpColor);
  const bodyWeft = hexToRgb(design.body.weftColor);
  const bodyFill = rgbToString(wovenFillColor(bodyWarp, bodyWeft, design.weaveType));

  const verticalBands: Array<{ rect: Rect; vertical: RGB; horizontal: RGB }> = [];
  const horizontalBands: Array<{ rect: Rect; vertical: RGB; horizontal: RGB }> = [];
  const stripeRects: string[] = [];

  for (const stripe of design.stripes) {
    const warp = hexToRgb(stripe.warpColor);
    const weft = hexToRgb(stripe.weftColor);
    const fill = rgbToString(wovenFillColor(warp, weft, design.weaveType));

    const rawRect = stripe.orientation === "vertical"
      ? { x: stripe.position, y: 0, w: stripe.width, h: designSize }
      : { x: 0, y: stripe.position, w: designSize, h: stripe.width };

    const scaled = clampRect(scaleRect(rawRect, designSize, width, height), width, height);
    if (!scaled) {
      continue;
    }

    stripeRects.push(rectSvg(scaled, fill));

    if (stripe.orientation === "vertical") {
      verticalBands.push({ rect: scaled, vertical: warp, horizontal: weft });
    } else {
      horizontalBands.push({ rect: scaled, vertical: warp, horizontal: weft });
    }
  }

  const intersections: string[] = [];
  for (const vertical of verticalBands) {
    for (const horizontal of horizontalBands) {
      const intersection = rectIntersection(vertical.rect, horizontal.rect);
      if (!intersection) {
        continue;
      }

      const interWarp = darken(vertical.vertical, 0.064);
      const interWeft = darken(horizontal.horizontal, 0.064);
      intersections.push(rectSvg(intersection, rgbToString(wovenFillColor(interWarp, interWeft, design.weaveType)), 0.94));
    }
  }

  return `
<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Submitted textile mockup matching the live design sheet" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="mockupShadow-${idSuffix}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#2b2119" flood-opacity="0.12" />
    </filter>
    <clipPath id="mockupClip-${idSuffix}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="18" />
    </clipPath>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" rx="18" fill="#f8f4ed" filter="url(#mockupShadow-${idSuffix})" />
  <g clip-path="url(#mockupClip-${idSuffix})">
    <rect x="0" y="0" width="${width}" height="${height}" fill="${bodyFill}" />
    ${stripeRects.join("\n    ")}
    ${intersections.join("\n    ")}
    ${buildTextureOverlay(width, height, design.weaveType, idSuffix)}
    <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#3f3328" stroke-opacity="0.16" stroke-width="2" />
  </g>
</svg>`.trim();
}
