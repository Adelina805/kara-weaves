"use client";

import { useState, type ReactNode } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

type SectionProps = {
  title: string;
  info?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

function SectionChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        "h-4 w-4 shrink-0 text-stone-500 transition-transform",
        expanded ? "rotate-90" : "",
      ].join(" ")}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function Section({
  title,
  info,
  action,
  children,
  collapsible = false,
  defaultCollapsed = false,
}: SectionProps) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);

  const titleHeading = (
    <h3 className="text-sm font-bold uppercase tracking-wide text-stone-700">{title}</h3>
  );
  const infoTooltip = info ? <InfoTooltip content={info} /> : null;

  return (
    <section className="border-t border-stone-200 pt-4 mt-4 first:mt-0 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        {collapsible ? (
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              className="flex min-w-0 items-center gap-1.5 text-left"
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              <SectionChevron expanded={expanded} />
              {titleHeading}
            </button>
            {infoTooltip}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {titleHeading}
            {infoTooltip}
          </div>
        )}
        {action}
      </div>
      {!collapsible || expanded ? children : null}
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
