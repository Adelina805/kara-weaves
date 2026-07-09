import type { RulerUnit } from "@/lib/fabric";

type UnitSegmentProps = {
  unit: RulerUnit;
  onChange: (unit: RulerUnit) => void;
};

export function UnitSegment({ unit, onChange }: UnitSegmentProps) {
  const segments: { value: RulerUnit; label: string }[] = [
    { value: "metric", label: "cm" },
    { value: "imperial", label: "in" },
  ];

  return (
    <div
      className="inline-flex rounded border border-stone-200 p-px"
      role="radiogroup"
      aria-label="Display units"
    >
      {segments.map((segment) => {
        const isActive = unit === segment.value;
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            className={[
              "rounded-sm px-1.5 py-0.5 text-[10px] font-medium leading-none transition-colors",
              isActive
                ? "bg-stone-100 text-stone-700"
                : "text-stone-400 hover:text-stone-600",
            ].join(" ")}
            onClick={() => onChange(segment.value)}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}
