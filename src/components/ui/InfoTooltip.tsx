import type { ReactNode } from "react";

type InfoTooltipProps = {
  content: ReactNode;
};

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="More information"
        className="inline-flex items-center justify-center rounded p-0.5 text-stone-400 transition-colors hover:text-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-10 ml-1.5 w-max max-w-[220px] -translate-y-1/2 rounded border border-stone-200 bg-white px-2 py-1 text-xs font-medium leading-relaxed text-stone-600 shadow-sm opacity-0 transition-opacity duration-75 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
