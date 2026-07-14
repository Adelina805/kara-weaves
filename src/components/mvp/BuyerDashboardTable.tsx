"use client";

import { useEffect, useMemo, useState } from "react";
import { readSubmittedDesigns, type SubmittedRecipePayload } from "@/lib/mvp/submissions";

export type BuyerFallbackRow = {
  id: string;
  submittedAt: string;
  orderCode: string;
  designTitle: string;
  productName: string;
  weaveType: string;
  stripeSummary: string;
  dimensions: string;
  totalPicks: number;
  status: string;
  mockupSvg: string;
};

export type BuyerMilestoneRow = {
  id: string;
  stage: string;
  notes: string;
  occurredAt: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function colorSwatch(color: string, label: string) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-3 w-3 rounded-full border border-stone-200" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  );
}

function submissionToRow(payload: SubmittedRecipePayload): BuyerFallbackRow {
  return {
    id: payload.id,
    submittedAt: payload.acceptedAt ?? payload.submittedAt,
    orderCode: payload.buyerToken,
    designTitle: payload.designTitle,
    productName: "Custom woven textile",
    weaveType: payload.weaveType,
    stripeSummary: `${payload.verticalStripeCount} vertical · ${payload.horizontalStripeCount} horizontal`,
    dimensions: `${payload.recipe.setupSummary.widthIn} in × ${payload.recipe.estimatedOnLoomLengthIn} in on-loom`,
    totalPicks: payload.recipe.totalPicks,
    status: payload.accepted ? "Accepted" : "Submitted",
    mockupSvg: payload.mockupSvg ?? "",
  };
}

export function BuyerDashboardTable({
  token,
  fallbackRow,
  milestones,
}: {
  token: string;
  fallbackRow: BuyerFallbackRow;
  milestones: BuyerMilestoneRow[];
}) {
  const [submissions, setSubmissions] = useState<SubmittedRecipePayload[]>([]);

  useEffect(() => {
    setSubmissions(readSubmittedDesigns().filter((payload) => payload.buyerToken === token));
  }, [token]);

  const designRows = useMemo(() => {
    const localRows = submissions.map(submissionToRow);
    return localRows.length > 0 ? localRows : [fallbackRow];
  }, [fallbackRow, submissions]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Buyer Dashboard</p>
            <h1 className="mt-2 text-3xl font-black text-stone-950">Submitted design table</h1>
          </div>
          <p className="text-sm text-stone-500">{designRows.length} retained design{designRows.length === 1 ? "" : "s"}</p>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-[0.18em] text-stone-500">
              <tr>
                <th className="px-4 py-3">Mockup</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Design</th>
                <th className="px-4 py-3">Weave</th>
                <th className="px-4 py-3">Stripes</th>
                <th className="px-4 py-3">Dimensions</th>
                <th className="px-4 py-3">Total picks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {designRows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3">
                    {row.mockupSvg ? (
                      <div
                        className="h-20 w-20 overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                        dangerouslySetInnerHTML={{ __html: row.mockupSvg }}
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-xl border border-dashed border-stone-300 bg-stone-50" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-700">{formatDate(row.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-stone-950">{row.designTitle}</p>
                    <p className="mt-1 text-xs text-stone-500">{row.productName}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{row.weaveType}</td>
                  <td className="px-4 py-3">{row.stripeSummary}</td>
                  <td className="px-4 py-3">{row.dimensions}</td>
                  <td className="px-4 py-3 font-bold text-stone-950">{row.totalPicks}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-600">
            The dashboard is reading the retained submission list from this browser session. New submissions from the design sheet are appended instead of replacing older rows.
          </div>
        ) : null}
      </section>

      {submissions.length > 0 ? (
        <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Submitted yarn colors</p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-stone-100 text-xs uppercase tracking-[0.18em] text-stone-500">
                <tr>
                  <th className="px-4 py-3">Design</th>
                  <th className="px-4 py-3">Body warp</th>
                  <th className="px-4 py-3">Body weft</th>
                  <th className="px-4 py-3">Recipe version</th>
                  <th className="px-4 py-3">On-loom length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white">
                {submissions.map((payload) => (
                  <tr key={`${payload.id}-colors`}>
                    <td className="px-4 py-3 font-bold text-stone-950">{payload.designTitle}</td>
                    <td className="px-4 py-3">{colorSwatch(payload.bodyWarpColor, payload.bodyWarpColor)}</td>
                    <td className="px-4 py-3">{colorSwatch(payload.bodyWeftColor, payload.bodyWeftColor)}</td>
                    <td className="px-4 py-3">v{payload.recipe.version}</td>
                    <td className="px-4 py-3">{payload.recipe.estimatedOnLoomLengthIn} in</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Buyer-visible milestones</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-xs uppercase tracking-[0.18em] text-stone-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {milestones.map((event, index) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 font-bold">{index + 1}</td>
                  <td className="px-4 py-3 font-bold text-stone-950">{event.stage}</td>
                  <td className="px-4 py-3 text-stone-600">{event.notes}</td>
                  <td className="px-4 py-3">{formatDate(event.occurredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
