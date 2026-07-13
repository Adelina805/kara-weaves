import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyerDashboardTable, type BuyerFallbackRow, type BuyerMilestoneRow } from "@/components/mvp/BuyerDashboardTable";
import { mvpData } from "@/lib/mvp/sample-data";
import {
  buildMockupSvg,
  buyerStageLabel,
  findCooperative,
  findLoom,
  findProduct,
  generateTechnicalRecipe,
  getBuyerSafeEvents,
} from "@/lib/mvp/rules";

export default async function BuyerDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ accepted?: string }>;
}) {
  const { token } = await params;
  const query = searchParams ? await searchParams : {};
  const wasAccepted = query.accepted === "1";
  const order = mvpData.orders.find((item) => item.buyerPublicToken === token);

  if (!order || !order.publishedAt) {
    notFound();
  }

  const design = mvpData.designs.find((item) => item.id === order.designId);

  if (!design || design.status !== "approved") {
    notFound();
  }

  const product = findProduct(design);
  const cooperative = findCooperative(order.cooperativeId);
  const loom = findLoom(order.loomId);
  const recipe = generateTechnicalRecipe(design);
  const mockupSvg = buildMockupSvg(design);
  const buyerEvents = getBuyerSafeEvents(order);

  const fallbackRow: BuyerFallbackRow = {
    id: order.id,
    submittedAt: order.publishedAt,
    orderCode: order.orderCode,
    designTitle: design.title,
    productName: product?.name ?? "Custom woven textile",
    weaveType: "plain",
    stripeSummary: `${design.segments.filter((segment) => segment.segmentType === "stripe").length} stripe segment(s)`,
    dimensions: `${design.widthIn} in × ${design.finishedLengthIn} in`,
    totalPicks: recipe.totalPicks,
    status: order.status.replaceAll("_", " "),
    mockupSvg,
  };

  const milestones: BuyerMilestoneRow[] = buyerEvents.map((event) => ({
    id: event.id,
    stage: buyerStageLabel(event.stage),
    notes: event.notes,
    occurredAt: event.occurredAt,
  }));

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-stone-900">
      <section className="mx-auto max-w-7xl px-5 py-8 lg:py-12">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/mvp" className="text-amber-800 hover:text-amber-950">
              ← Main sheet
            </Link>
            <Link href="/design-sheet" className="text-amber-800 hover:text-amber-950">
              Design sheet
            </Link>
            <Link href="/artisan-recipe?generated=1" className="text-amber-800 hover:text-amber-950">
              Artisan recipe
            </Link>
          </div>
          <p className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-600">
            Buyer token: {token}
          </p>
        </div>

        {wasAccepted ? (
          <div className="mb-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Design accepted</p>
            <h2 className="mt-2 text-2xl font-black text-stone-950">Buyer dashboard published from the accepted design.</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-950">
              The dashboard below uses a simple tabular format. It also reads the retained list of submitted designs from this browser session.
            </p>
          </div>
        ) : null}

        <BuyerDashboardTable token={token} fallbackRow={fallbackRow} milestones={milestones} />

        <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Cooperative summary</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <tbody className="divide-y divide-stone-100 bg-white">
                <tr>
                  <th className="w-56 bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">Cooperative</th>
                  <td className="px-4 py-3 font-bold text-stone-950">{cooperative.name}</td>
                </tr>
                <tr>
                  <th className="bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">Location</th>
                  <td className="px-4 py-3">{cooperative.location}</td>
                </tr>
                <tr>
                  <th className="bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">Loom</th>
                  <td className="px-4 py-3">{loom.loomName} · {loom.loomType}</td>
                </tr>
                <tr>
                  <th className="bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">Buyer message</th>
                  <td className="px-4 py-3 leading-6 text-stone-600">{order.buyerMessage}</td>
                </tr>
                <tr>
                  <th className="bg-stone-50 px-4 py-3 text-xs uppercase tracking-[0.18em] text-stone-500">Story</th>
                  <td className="px-4 py-3 leading-6 text-stone-600">{cooperative.story}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
