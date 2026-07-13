import Link from "next/link";
import { PageChrome } from "@/components/mvp/PageChrome";
import { StatusPill } from "@/components/mvp/StatusPill";
import { SubmittedRecipeCard } from "@/components/mvp/SubmittedRecipeCard";
import { PrintCardButton } from "@/components/mvp/PrintCardButton";
import { ArtisanPrintCard } from "@/components/mvp/ArtisanPrintCard";
import { getPrimaryDesign, getPrimaryOrder } from "@/lib/mvp/sample-data";
import {
  buildMockupSvg,
  findCooperative,
  findLoom,
  findLoomSpec,
  findProduct,
  generateTechnicalRecipe,
  validateDesign,
} from "@/lib/mvp/rules";

export default function ArtisanRecipePage() {
  const design = getPrimaryDesign();
  const order = getPrimaryOrder();
  const product = findProduct(design);
  const loomSpec = findLoomSpec(design);
  const loom = findLoom(order.loomId);
  const cooperative = findCooperative(order.cooperativeId);
  const recipe = generateTechnicalRecipe(design);
  const validation = validateDesign(design);
  const mockupSvg = buildMockupSvg(design, { width: 520, height: 280 });
  const samplePrintCardId = "sample-artisan-print-card";

  return (
    <PageChrome
      eyebrow="Artisan Recipe"
      title="Printable technical recipe and instruction card"
      description="This page turns the saved design record into a loom-aware pick sequence, setup summary, and artisan-facing card. It is generated from recipe data rather than manually retyped instructions."
    >
      <SubmittedRecipeCard />

      <div className="mb-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm lg:flex lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Recipe generated from submitted design</p>
          <h2 className="mt-2 text-2xl font-black text-stone-950">Review the artisan card, then accept the design for buyer publishing.</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-950">Acceptance opens the buyer dashboard and shows only buyer-safe details: approved mockup, cooperative story, and progress milestones.</p>
        </div>
        <Link
          href={`/buyer-dashboard/${order.buyerPublicToken}?accepted=1`}
          className="mt-4 inline-flex rounded-full bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 lg:mt-0"
        >
          Accept design and open buyer dashboard
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Recipe Summary</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">{design.title}</h2>
          <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            <div dangerouslySetInnerHTML={{ __html: mockupSvg }} />
          </div>

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">Order</dt>
              <dd className="text-stone-950">{order.orderCode}</dd>
            </div>
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">Product</dt>
              <dd className="text-stone-950">{product?.name}</dd>
            </div>
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">Width</dt>
              <dd className="text-stone-950">{recipe.setupSummary.widthIn} in</dd>
            </div>
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">Target PPI</dt>
              <dd className="text-stone-950">{recipe.setupSummary.targetPpi}</dd>
            </div>
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">Total picks</dt>
              <dd className="text-stone-950">{recipe.totalPicks}</dd>
            </div>
            <div className="flex justify-between rounded-2xl bg-stone-50 p-4">
              <dt className="font-bold text-stone-600">On-loom length</dt>
              <dd className="text-stone-950">{recipe.estimatedOnLoomLengthIn} in</dd>
            </div>
          </dl>

          <div className="mt-6 rounded-[1.75rem] border border-stone-200 bg-white p-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Clean print card</p>
                <p className="mt-1 text-xs leading-5 text-stone-500">Prints only the artisan card: PPI, warp/weft, thickness, and mock image.</p>
              </div>
              <PrintCardButton label="Print card" targetId={samplePrintCardId} className="rounded-full bg-stone-950 hover:bg-stone-800" />
            </div>
            <ArtisanPrintCard
              id={samplePrintCardId}
              title={design.title}
              weaveType="loose"
              mockupSvg={mockupSvg}
              recipe={recipe}
              bodyWarpColor="#d9cfba"
              bodyWeftColor="#f7f2e7"
              warpThickness={4}
              weftThickness={4}
              stripes={[]}
              notes={recipe.artisanNotes}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/buyer-dashboard/${order.buyerPublicToken}`} className="rounded-full border border-stone-200 px-4 py-2 text-sm font-bold text-stone-700 hover:text-amber-800">
              Buyer view
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Loom Setup</p>
            <h2 className="mt-2 text-2xl font-black text-stone-950">{loomSpec.name}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-stone-50 p-4"><strong>Loom</strong><br />{loom.loomCode} · {loom.loomType}</div>
              <div className="rounded-2xl bg-stone-50 p-4"><strong>Cooperative</strong><br />{cooperative.name}</div>
              <div className="rounded-2xl bg-stone-50 p-4"><strong>Reed density</strong><br />{recipe.setupSummary.reedDensityDpi} DPI</div>
              <div className="rounded-2xl bg-stone-50 p-4"><strong>Take-up + shrinkage</strong><br />{Math.round((recipe.setupSummary.takeupPct + recipe.setupSummary.shrinkagePct) * 100)}%</div>
            </div>
            <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              {loomSpec.beatTensionNotes} {loomSpec.compatibilityNotes}
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Pick Sequence</p>
              <h2 className="mt-2 text-2xl font-black text-stone-950">Version {recipe.version} current recipe</h2>
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-[0.18em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Yarn</th>
                  <th className="px-4 py-3">Length</th>
                  <th className="px-4 py-3">Picks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recipe.pickSequence.map((item) => (
                  <tr key={item.sortOrder}>
                    <td className="px-4 py-3 font-bold">{item.sortOrder}</td>
                    <td className="px-4 py-3 capitalize">{item.segmentType}</td>
                    <td className="px-4 py-3">
                      <span className="mr-2 inline-block h-3 w-3 rounded-full align-middle" style={{ backgroundColor: item.hexCode }} />
                      {item.yarnCode}
                    </td>
                    <td className="px-4 py-3">{item.lengthIn} in</td>
                    <td className="px-4 py-3 font-bold">{item.calculatedPicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Validation Attached to Recipe</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {validation.map((item) => (
                <StatusPill key={item.ruleCode} label={item.ruleCode} severity={item.severity} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{recipe.artisanNotes}</p>
          </div>
        </section>
      </div>
    </PageChrome>
  );
}
