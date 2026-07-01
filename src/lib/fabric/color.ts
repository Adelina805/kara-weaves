import type { RGB } from "./types";

export function hexToRgb(hex: string): RGB {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.substring(0, 2), 16),
    g: parseInt(normalized.substring(2, 4), 16),
    b: parseInt(normalized.substring(4, 6), 16),
  };
}

export function rgbToString(color: RGB): string {
  return `rgb(${Math.round(color.r)},${Math.round(color.g)},${Math.round(color.b)})`;
}

export function clamp(value: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, value));
}

export function mix(color1: RGB, color2: RGB, amount: number): RGB {
  return {
    r: color1.r * amount + color2.r * (1 - amount),
    g: color1.g * amount + color2.g * (1 - amount),
    b: color1.b * amount + color2.b * (1 - amount),
  };
}

export function darken(color: RGB, amount: number): RGB {
  return {
    r: clamp(color.r * (1 - amount)),
    g: clamp(color.g * (1 - amount)),
    b: clamp(color.b * (1 - amount)),
  };
}

export function lighten(color: RGB, amount: number): RGB {
  return {
    r: clamp(color.r + (255 - color.r) * amount),
    g: clamp(color.g + (255 - color.g) * amount),
    b: clamp(color.b + (255 - color.b) * amount),
  };
}

export function adjustColor(color: RGB, amount: number): RGB {
  return {
    r: clamp(color.r + amount),
    g: clamp(color.g + amount),
    b: clamp(color.b + amount),
  };
}
