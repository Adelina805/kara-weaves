import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/mvp", label: "Main Sheet" },
  { href: "/design-sheet", label: "Design Sheet" },
  { href: "/artisan-recipe", label: "Artisan Recipe" },
  { href: "/buyer-dashboard/demo-buyer-token", label: "Buyer Dashboard" },
];

export function PageChrome({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <header className="border-b border-stone-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/mvp" className="group">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-800">Kara Weaves MVP</p>
            <p className="mt-1 text-lg font-black tracking-tight text-stone-950 group-hover:text-amber-900">
              Digital Pipeline Workspace
            </p>
          </Link>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-stone-200 bg-white px-3 py-2 text-stone-700 shadow-sm transition hover:border-amber-300 hover:text-amber-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
        <div className="mb-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">{eyebrow}</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-stone-950 lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-stone-600 lg:text-lg">{description}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
