import type { FabricDesign, Stripe } from "@/lib/fabric";
import type { TechnicalRecipe } from "@/lib/mvp/types";

type ArtisanPrintCardProps = {
  id?: string;
  title: string;
  weaveType: FabricDesign["weaveType"] | string;
  mockupSvg?: string;
  recipe: TechnicalRecipe;
  bodyWarpColor: string;
  bodyWeftColor: string;
  warpThickness?: number;
  weftThickness?: number;
  stripes?: Stripe[];
  submittedAt?: string;
  notes?: string;
};

function formatWeaveType(value: string) {
  if (value === "loose") return "Loose / gauze weave";
  if (value === "waffle") return "Waffle weave";
  if (value === "plain") return "Plain weave";
  return value;
}

function formatDate(value?: string) {
  if (!value) return "Current recipe";

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Current recipe";
  }
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 shrink-0 rounded-full border border-stone-300 align-middle"
      style={{ backgroundColor: color }}
    />
  );
}

export function ArtisanPrintCard({
  id,
  title,
  weaveType,
  mockupSvg,
  recipe,
  bodyWarpColor,
  bodyWeftColor,
  warpThickness,
  weftThickness,
  stripes = [],
  submittedAt,
  notes,
}: ArtisanPrintCardProps) {
  const verticalStripes = stripes.filter((stripe) => stripe.orientation === "vertical");
  const horizontalStripes = stripes.filter((stripe) => stripe.orientation === "horizontal");

  return (
    <section
      id={id}
      className="artisan-print-card rounded-[1.5rem] border border-stone-300 bg-white p-6 text-stone-950 shadow-sm"
    >
      <header className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.26em] text-amber-700">Kara Weaves</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight">Artisan Recipe Card</h1>
          <p className="mt-1 text-sm font-semibold text-stone-600">{title}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Generated</p>
          <p className="mt-1 text-sm font-bold text-stone-950">{formatDate(submittedAt)}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Version {recipe.version}</p>
        </div>
      </header>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">PPI</p>
          <p className="mt-1 text-2xl font-black">{recipe.setupSummary.targetPpi}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Reed DPI</p>
          <p className="mt-1 text-2xl font-black">{recipe.setupSummary.reedDensityDpi}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Width</p>
          <p className="mt-1 text-2xl font-black">{recipe.setupSummary.widthIn} in</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-stone-500">Total Picks</p>
          <p className="mt-1 text-2xl font-black">{recipe.totalPicks}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-3">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Mock image</p>
          <div className="artisan-print-mockup overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {mockupSvg ? (
              <div dangerouslySetInnerHTML={{ __html: mockupSvg }} />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm font-bold text-stone-400">No mock image available</div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Warp details</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3">
              <span className="flex items-center gap-2 font-bold"><ColorSwatch color={bodyWarpColor} /> Body warp</span>
              <span className="text-right text-sm font-semibold">{bodyWarpColor}</span>
            </div>
            <div className="mt-2 flex justify-between rounded-2xl bg-stone-50 p-3 text-sm">
              <span className="font-bold text-stone-600">Warp thickness</span>
              <span>{warpThickness ?? "-"} px/thread</span>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Weft details</p>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-stone-50 p-3">
              <span className="flex items-center gap-2 font-bold"><ColorSwatch color={bodyWeftColor} /> Body weft</span>
              <span className="text-right text-sm font-semibold">{bodyWeftColor}</span>
            </div>
            <div className="mt-2 flex justify-between rounded-2xl bg-stone-50 p-3 text-sm">
              <span className="font-bold text-stone-600">Weft thickness</span>
              <span>{weftThickness ?? "-"} px/thread</span>
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Weave setup</p>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between rounded-2xl bg-stone-50 p-3"><span className="font-bold text-stone-600">Weave</span><span>{formatWeaveType(String(weaveType))}</span></div>
              <div className="flex justify-between rounded-2xl bg-stone-50 p-3"><span className="font-bold text-stone-600">On-loom length</span><span>{recipe.estimatedOnLoomLengthIn} in</span></div>
              <div className="flex justify-between rounded-2xl bg-stone-50 p-3"><span className="font-bold text-stone-600">Take-up + shrinkage</span><span>{Math.round((recipe.setupSummary.takeupPct + recipe.setupSummary.shrinkagePct) * 100)}%</span></div>
            </div>
          </div>
        </div>
      </div>

      {stripes.length > 0 ? (
        <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Stripe yarn details</p>
          <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-stone-100 uppercase tracking-[0.16em] text-stone-500">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Position</th>
                  <th className="px-3 py-2">Width</th>
                  <th className="px-3 py-2">Warp color</th>
                  <th className="px-3 py-2">Weft color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stripes.map((stripe, index) => (
                  <tr key={stripe.id ?? index}>
                    <td className="px-3 py-2 capitalize">{stripe.orientation}</td>
                    <td className="px-3 py-2">{Math.round(stripe.position)} px</td>
                    <td className="px-3 py-2">{Math.round(stripe.width)} px</td>
                    <td className="px-3 py-2"><span className="flex items-center gap-2"><ColorSwatch color={stripe.warpColor} />{stripe.warpColor}</span></td>
                    <td className="px-3 py-2"><span className="flex items-center gap-2"><ColorSwatch color={stripe.weftColor} />{stripe.weftColor}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Vertical stripes: {verticalStripes.length} · Horizontal stripes: {horizontalStripes.length}
          </p>
        </div>
      ) : null}

      <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-stone-500">Weft pick sequence</p>
        <div className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-stone-100 uppercase tracking-[0.16em] text-stone-500">
              <tr>
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Segment</th>
                <th className="px-3 py-2">Yarn</th>
                <th className="px-3 py-2">Length</th>
                <th className="px-3 py-2">Picks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recipe.pickSequence.map((item) => (
                <tr key={`${item.sortOrder}-${item.hexCode}`}>
                  <td className="px-3 py-2 font-black">{item.sortOrder}</td>
                  <td className="px-3 py-2 capitalize">{item.segmentType}</td>
                  <td className="px-3 py-2"><span className="flex items-center gap-2"><ColorSwatch color={item.hexCode} />{item.yarnCode}</span></td>
                  <td className="px-3 py-2">{item.lengthIn} in</td>
                  <td className="px-3 py-2 font-black">{item.calculatedPicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <strong>Artisan note:</strong> {notes ?? recipe.artisanNotes}
      </footer>
    </section>
  );
}
