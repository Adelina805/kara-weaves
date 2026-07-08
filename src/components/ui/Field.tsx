import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";
import { PresetColorPicker } from "@/components/ui/PresetColorPicker";

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
    <select
      className={[
        "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900",
        "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

type ColorInputProps = {
  id?: string;
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function ColorInput({ id, value, onChange, className = "" }: ColorInputProps) {
  return (
    <PresetColorPicker
      id={id}
      value={value}
      className={className}
      onChange={(hex) =>
        onChange?.({ target: { value: hex } } as ChangeEvent<HTMLInputElement>)
      }
    />
  );
}

type RangeInputProps = InputHTMLAttributes<HTMLInputElement> & {
  valueLabel?: string | number;
};

export function RangeInput({ valueLabel, className = "", ...props }: RangeInputProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        className={["w-full accent-blue-600", className].join(" ")}
        {...props}
      />
      {valueLabel !== undefined ? (
        <span className="min-w-10 text-right text-xs tabular-nums text-stone-600">
          {valueLabel}
        </span>
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
        className={["h-4 w-4 rounded border-stone-300 accent-blue-600", className].join(" ")}
        {...props}
      />
      {label}
    </label>
  );
}
