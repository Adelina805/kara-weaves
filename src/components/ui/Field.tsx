"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function Field({ label, hint, className = "", children }: FieldProps) {
  return (
    <label className={["mt-3 block first:mt-0", className].join(" ")}>
      <span className="text-sm font-semibold text-stone-800">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </label>
  );
}

type SelectProps = InputHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={[
          "w-full appearance-none rounded-lg border border-stone-300 bg-white py-2 pl-3 pr-10 text-sm text-stone-900",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
          className,
        ].join(" ")}
        {...props}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

type RangeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  valueLabel?: string | number;
  valueLabelPosition?: "inline" | "below";
  editableValueLabel?: boolean;
};

export function RangeInput({
  valueLabel,
  valueLabelPosition = "inline",
  editableValueLabel = false,
  className = "",
  min = 0,
  max = 100,
  step,
  onChange,
  ...props
}: RangeInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const labelClassName =
    valueLabelPosition === "below"
      ? "text-center text-xs tabular-nums text-stone-600"
      : "w-7 shrink-0 text-center text-xs tabular-nums text-stone-600";

  const startEditing = () => {
    if (!editableValueLabel) {
      return;
    }
    setDraft(String(valueLabel ?? ""));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setDraft("");
  };

  const commitEditing = () => {
    const parsed = parseFloat(draft);
    if (Number.isNaN(parsed) || draft.trim() === "") {
      cancelEditing();
      return;
    }

    const clamped = Math.min(Number(max), Math.max(Number(min), parsed));
    onChange?.({ target: { value: String(clamped) } } as ChangeEvent<HTMLInputElement>);
    setIsEditing(false);
    setDraft("");
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitEditing();
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <div
      className={
        valueLabelPosition === "below" ? "flex flex-col items-stretch gap-1" : "flex items-center gap-2"
      }
    >
      <input
        type="range"
        className={["w-full accent-black", className].join(" ")}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        {...props}
      />
      {valueLabel !== undefined ? (
        isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            inputMode="decimal"
            value={draft}
            className={[
              "shrink-0 rounded border border-stone-300 bg-white px-1 py-0 text-center text-xs tabular-nums text-stone-900",
              "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200",
              valueLabelPosition === "below" ? "w-full" : "w-14",
            ].join(" ")}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitEditing}
            onKeyDown={handleEditKeyDown}
          />
        ) : (
          <span
            className={[
              labelClassName,
              editableValueLabel ? "cursor-text rounded hover:bg-stone-100" : "",
            ].join(" ")}
            title={editableValueLabel ? "Click to edit" : undefined}
            onClick={startEditing}
            onKeyDown={
              editableValueLabel
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      startEditing();
                    }
                  }
                : undefined
            }
            role={editableValueLabel ? "button" : undefined}
            tabIndex={editableValueLabel ? 0 : undefined}
          >
            {valueLabel}
          </span>
        )
      ) : null}
    </div>
  );
}

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
};

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-stone-800">
      <input
        type="checkbox"
        className={["h-4 w-4 rounded border-stone-300 accent-black", className].join(" ")}
        {...props}
      />
      {label}
    </label>
  );
}
