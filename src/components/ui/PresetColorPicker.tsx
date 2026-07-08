"use client";

import { useEffect, useRef, useState } from "react";
import { COLOR_PRESETS } from "@/lib/fabric/color-presets";

type PresetColorPickerProps = {
  id?: string;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

export function PresetColorPicker({
  id,
  value,
  onChange,
  className = "",
}: PresetColorPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={["relative", className].join(" ")}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="h-10 w-full cursor-pointer rounded-lg border border-stone-300 p-1"
        style={{ backgroundColor: value }}
        onClick={() => setOpen((current) => !current)}
      />
      {open ? (
        <div
          role="listbox"
          aria-label="Preset colors"
          className="absolute left-0 top-full z-50 mt-1 rounded-lg border border-stone-200 bg-white p-3 shadow-lg"
        >
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const selected = preset.hex.toLowerCase() === value.toLowerCase();

              return (
                <button
                  key={preset.hex}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={preset.name}
                  className={[
                    "group relative h-8 w-8 cursor-pointer rounded-md border border-stone-200",
                    selected ? "ring-2 ring-blue-500 ring-offset-1" : "",
                  ].join(" ")}
                  style={{ backgroundColor: preset.hex }}
                  onClick={() => {
                    onChange(preset.hex);
                    setOpen(false);
                  }}
                >
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-stone-800 px-2 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity duration-75 group-hover:opacity-100">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
