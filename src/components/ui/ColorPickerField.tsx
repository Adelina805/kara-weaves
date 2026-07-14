"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { HexColorPicker } from "react-colorful";

const HEX6_PATTERN = /^#?[0-9a-fA-F]{6}$/;
const HEX3_PATTERN = /^#?[0-9a-fA-F]{3}$/;
const POPOVER_GAP = 8;
const VIEWPORT_PADDING = 8;

type ColorPickerFieldProps = {
  id?: string;
  label: ReactNode;
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

function normalizeHex(input: string): string | null {
  const trimmed = input.trim();

  if (HEX6_PATTERN.test(trimmed)) {
    const digits = trimmed.replace("#", "").toUpperCase();
    return `#${digits}`;
  }

  if (HEX3_PATTERN.test(trimmed)) {
    const digits = trimmed.replace("#", "").toUpperCase();
    return `#${digits[0]}${digits[0]}${digits[1]}${digits[1]}${digits[2]}${digits[2]}`;
  }

  return null;
}

function formatDisplayHex(hex: string): string {
  return normalizeHex(hex) ?? "#000000";
}

type PopoverPosition = {
  top: number;
  left: number;
  width: number;
};

function computePopoverPosition(
  anchorRect: DOMRect,
  popoverHeight: number,
): PopoverPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const width = Math.min(
    anchorRect.width,
    viewportWidth - VIEWPORT_PADDING * 2,
  );

  let left = anchorRect.left;
  left = Math.min(
    left,
    viewportWidth - width - VIEWPORT_PADDING,
  );
  left = Math.max(VIEWPORT_PADDING, left);

  const spaceBelow = viewportHeight - anchorRect.bottom - VIEWPORT_PADDING;
  const spaceAbove = anchorRect.top - VIEWPORT_PADDING;
  const preferBelow = spaceBelow >= popoverHeight + POPOVER_GAP || spaceBelow >= spaceAbove;

  let top = preferBelow
    ? anchorRect.bottom + POPOVER_GAP
    : anchorRect.top - popoverHeight - POPOVER_GAP;

  top = Math.min(top, viewportHeight - popoverHeight - VIEWPORT_PADDING);
  top = Math.max(VIEWPORT_PADDING, top);

  return { top, left, width };
}

export function ColorPickerField({
  id,
  label,
  value,
  onChange,
  className = "",
}: ColorPickerFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const popoverId = `${fieldId}-popover`;
  const swatchId = `${fieldId}-swatch`;
  const hexInputId = `${fieldId}-hex`;

  const normalizedValue = formatDisplayHex(value);
  const [draftHex, setDraftHex] = useState(normalizedValue);
  const [open, setOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const [mounted, setMounted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const swatchRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDraftHex(normalizedValue);
  }, [normalizedValue]);

  const emitChange = useCallback(
    (next: string) => {
      const normalized = normalizeHex(next);
      if (!normalized || normalized === normalizedValue) {
        return;
      }
      onChange(normalized);
    },
    [normalizedValue, onChange],
  );

  const commitDraft = useCallback(() => {
    const normalized = normalizeHex(draftHex);
    if (normalized) {
      setDraftHex(normalized);
      emitChange(normalized);
      return;
    }
    setDraftHex(normalizedValue);
  }, [draftHex, emitChange, normalizedValue]);

  const updatePopoverPosition = useCallback(() => {
    const anchor = controlRef.current;
    if (!anchor) {
      return;
    }

    const popoverHeight = popoverRef.current?.offsetHeight ?? 146;
    setPopoverPosition(computePopoverPosition(anchor.getBoundingClientRect(), popoverHeight));
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    updatePopoverPosition();

    function handleReposition() {
      updatePopoverPosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePopoverPosition]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        swatchRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleDraftChange = (next: string) => {
    setDraftHex(next);
    const normalized = normalizeHex(next);
    if (normalized) {
      emitChange(normalized);
    }
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitDraft();
      event.currentTarget.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraftHex(normalizedValue);
      event.currentTarget.blur();
    }
  };

  const popoverStyle: CSSProperties = {
    position: "fixed",
    top: popoverPosition.top,
    left: popoverPosition.left,
    width: popoverPosition.width,
    zIndex: 50,
  };

  return (
    <div ref={rootRef} className={["flex flex-col gap-1.5", className].join(" ")}>
      <label
        htmlFor={hexInputId}
        className="text-sm font-semibold text-stone-800"
      >
        {label}
      </label>

      <div
        ref={controlRef}
        className="flex items-stretch rounded-lg border border-stone-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
      >
        <button
          ref={swatchRef}
          id={swatchId}
          type="button"
          aria-label={`Open color picker for ${typeof label === "string" ? label : "color"}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={popoverId}
          className="m-1 h-7 w-7 shrink-0 cursor-pointer rounded-md border border-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ backgroundColor: normalizedValue }}
          onClick={() => setOpen((current) => !current)}
        />

        {/* Value stack: hex now; Pantone can be added below without redesigning the shell */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pr-2">
          <input
            id={hexInputId}
            type="text"
            spellCheck={false}
            autoComplete="off"
            value={draftHex}
            aria-label="Hex color"
            className="w-full bg-transparent text-sm uppercase tracking-wide text-stone-900 outline-none"
            onChange={(event) => handleDraftChange(event.target.value)}
            onBlur={commitDraft}
            onKeyDown={handleDraftKeyDown}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text");
              const normalized = normalizeHex(pasted);
              if (normalized) {
                event.preventDefault();
                setDraftHex(normalized);
                emitChange(normalized);
              }
            }}
          />
        </div>
      </div>

      {mounted && open
        ? createPortal(
            <div
              ref={popoverRef}
              id={popoverId}
              role="dialog"
              aria-label="Color picker"
              style={popoverStyle}
              className="rounded-lg border border-stone-200 bg-white p-2 shadow-lg"
            >
              <HexColorPicker
                className="kara-color-picker"
                color={normalizedValue}
                onChange={(hex) => {
                  const normalized = formatDisplayHex(hex);
                  setDraftHex(normalized);
                  emitChange(normalized);
                }}
                style={{ width: "100%", height: 128 }}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
