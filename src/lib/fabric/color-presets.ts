export type ColorPreset = {
  name: string;
  hex: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  { name: "Black", hex: "#2E2E2E" },
  { name: "White", hex: "#E3E0DB" },
  { name: "Rafia", hex: "#BEAD8C" },
  { name: "Brown", hex: "#6E483E" },
  { name: "Red", hex: "#B62B3E" },
  { name: "Pink", hex: "#D573A0" },
  { name: "Peach", hex: "#E99F7B" },
  { name: "Mustard", hex: "#D1AC46" },
  { name: "Lavender", hex: "#CECA7F" },
  { name: "Leaf Green", hex: "#7C9559" },
  { name: "Fern Green", hex: "#1F6263" },
  { name: "Forest Green", hex: "#38493F" },
  { name: "Midnight Blue", hex: "#36325B" },
  { name: "Purple", hex: "#672E86" },
  { name: "Sky Blue", hex: "#558ABD" },
  { name: "Aquamarine", hex: "#25B8D9" },
];

export const COLOR_PRESET_HEXES = new Set(
  COLOR_PRESETS.map((preset) => preset.hex.toLowerCase()),
);

export function getColorPresetName(hex: string): string | undefined {
  const normalized = hex.toLowerCase();
  return COLOR_PRESETS.find((preset) => preset.hex.toLowerCase() === normalized)?.name;
}
