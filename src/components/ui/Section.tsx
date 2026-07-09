import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

export function Section({ title, action, children }: SectionProps) {
  return (
    <section className="border-t border-stone-200 pt-4 mt-4 first:mt-0 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-stone-700">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

type PanelProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, subtitle, children, className = "" }: PanelProps) {
  return (
    <div
      className={[
        "rounded-xl border border-stone-200 bg-white p-4 shadow-sm",
        className,
      ].join(" ")}
    >
      <h2 className="text-lg font-bold text-stone-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-stone-500">{subtitle}</p> : null}
      {children}
    </div>
  );
}
