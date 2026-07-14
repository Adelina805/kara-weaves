import Link from "next/link";
import { MetricCard } from "@/components/mvp/MetricCard";
import { MockupPreview } from "@/components/mvp/MockupPreview";
import { PageChrome } from "@/components/mvp/PageChrome";
import { StatusPill } from "@/components/mvp/StatusPill";
import { getPrimaryDesign, getPrimaryOrder, mvpData } from "@/lib/mvp/sample-data";
import {
  buildMockupSvg,
  findCooperative,
  findLoom,
  findLoomSpec,
  findProduct,
  generateTechnicalRecipe,
  getBuyerSafeEvents,
  hasBlockingValidationErrors,
  validateDesign,
} from "@/lib/mvp/rules";

const workflowSteps = [
  "Designer input",
  "Loom/spec validation",
  "Technical recipe",
  "Approval",
  "Production link",
  "Buyer dashboard",
];

export default function MvpMainPage() {
  const design = getPrimaryDesign();
  const order = getPrimaryOrder();
  const product = findProduct(design);
  const loomSpec = findLoomSpec(design);
  const loom = findLoom(order.loomId);
  const cooperative = findCooperative(order.cooperativeId);
  const validation = validateDesign(design);
  const recipe = generateTechnicalRecipe(design);
  const buyerEvents = getBuyerSafeEvents(order);
  const mockupSvg = buildMockupSvg(design);
  const hasErrors = hasBlockingValidationErrors(validation);

  return (
    <PageChrome
      eyebrow="Main Sheet"
      title="End-to-end Kara Weaves digital pipeline"
      description="This dynamic main sheet connects the existing fabric design workspace to loom validation, recipe generation, cooperative assignment, and buyer transparency pages without changing the original kara-weaves-main design sheet."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        <Link
          href="/design-sheet"
          className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Navigate</p>
          <h2 className="mt-3 text-2xl font-black text-stone-950">Design Sheet</h2>
          <p className="mt-2 text-sm leading-6 text-stone-700">Open the existing Kara Weaves fabric designer workspace.</p>
        </Link>
        <Link
          href="/artisan-recipe"
          className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Navigate</p>
          <h2 className="mt-3 text-2xl font-black text-stone-950">Artisan Recipe</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">View the generated printable instruction card.</p>
        </Link>
        <Link
          href={`/buyer-dashboard/${order.buyerPublicToken}`}
          className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-500">Navigate</p>
          <h2 className="mt-3 text-2xl font-black text-stone-950">Buyer Dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Open the buyer-safe public progress view.</p>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Step {index + 1}</p>
                <p className="mt-2 text-lg font-black text-stone-950">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-[0.18em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Rule</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {validation.map((result) => (
                  <tr key={result.ruleCode}>
                    <td className="px-4 py-3 font-bold text-stone-900">{result.ruleCode}</td>
                    <td className="px-4 py-3"><StatusPill label={result.severity} severity={result.severity} /></td>
                    <td className="px-4 py-3 text-stone-600">{result.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageChrome>
  );
}
