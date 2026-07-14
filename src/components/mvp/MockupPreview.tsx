export function MockupPreview({ svg, label }: { svg: string; label: string }) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
      <div
        className="overflow-hidden rounded-[1.5rem] bg-stone-50"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
    </div>
  );
}
