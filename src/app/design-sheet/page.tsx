import Link from "next/link";
import { DesignSheetSubmissionShell } from "@/components/mvp/DesignSheetSubmissionShell";

export default function DesignSheetPage() {
  return (
    <main className="h-screen overflow-hidden bg-stone-100">
      <div className="absolute left-4 top-4 z-20 flex gap-2">
        <Link
          href="/mvp"
          className="rounded-full border border-stone-200 bg-white/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-700 shadow-sm backdrop-blur transition hover:text-amber-800"
        >
          Main Sheet
        </Link>
        <Link
          href="/artisan-recipe"
          className="rounded-full border border-stone-200 bg-white/90 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-700 shadow-sm backdrop-blur transition hover:text-amber-800"
        >
          Recipe
        </Link>
      </div>
      <DesignSheetSubmissionShell />
    </main>
  );
}
