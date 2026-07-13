import type { ValidationSeverity } from "@/lib/mvp/types";

const severityClasses: Record<ValidationSeverity, string> = {
  info: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
};

export function StatusPill({ label, severity = "info" }: { label: string; severity?: ValidationSeverity }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${severityClasses[severity]}`}>
      {label}
    </span>
  );
}
