"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/mvp/StatusPill";
import { MockupPreview } from "@/components/mvp/MockupPreview";
import { PrintCardButton } from "@/components/mvp/PrintCardButton";
import { ArtisanPrintCard } from "@/components/mvp/ArtisanPrintCard";
import {
  markSubmissionAccepted,
  readCurrentSubmission,
  type SubmittedRecipePayload,
} from "@/lib/mvp/submissions";

export function SubmittedRecipeCard() {
  const router = useRouter();
  const [payload, setPayload] = useState<SubmittedRecipePayload | null>(null);

  useEffect(() => {
    setPayload(readCurrentSubmission());
  }, []);

  if (!payload) {
    return null;
  }

  const printCardId = `artisan-print-card-${payload.id}`;

  function acceptAndOpenBuyerDashboard() {
    if (!payload) return;

    const acceptedAt = new Date().toISOString();
    markSubmissionAccepted(payload.id, acceptedAt);

    const acceptedPayload = {
      ...payload,
      accepted: true,
      acceptedAt,
    };

    setPayload(acceptedPayload);
    router.push(`/buyer-dashboard/${payload.buyerToken}?accepted=1`);
  }

  return (
    <section className="mb-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Live Submitted Recipe</p>
          <h2 className="mt-2 text-3xl font-black text-stone-950">{payload.designTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-950">
            This card was generated from the design-sheet submit button and stored locally for the MVP prototype.
          </p>
        </div>
        <StatusPill label={payload.accepted ? "accepted" : "awaiting acceptance"} severity="info" />
      </div>


      {payload.mockupSvg ? (
        <div className="mt-5 max-w-md">
          <MockupPreview svg={payload.mockupSvg} label="Submitted design mockup" />
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Weave</p>
          <p className="mt-2 text-lg font-black capitalize text-stone-950">{payload.weaveType}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Total picks</p>
          <p className="mt-2 text-lg font-black text-stone-950">{payload.recipe.totalPicks}</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">On-loom length</p>
          <p className="mt-2 text-lg font-black text-stone-950">{payload.recipe.estimatedOnLoomLengthIn} in</p>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Stripes</p>
          <p className="mt-2 text-lg font-black text-stone-950">{payload.verticalStripeCount} V · {payload.horizontalStripeCount} H</p>
        </div>
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-emerald-200 bg-white p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Printable artisan card preview</p>
            <p className="mt-1 text-xs leading-5 text-stone-500">The print button outputs only this clean one-page card, not the surrounding website UI.</p>
          </div>
          <PrintCardButton label="Print artisan card" targetId={printCardId} />
        </div>
        <ArtisanPrintCard
          id={printCardId}
          title={payload.designTitle}
          weaveType={payload.weaveType}
          mockupSvg={payload.mockupSvg}
          recipe={payload.recipe}
          bodyWarpColor={payload.bodyWarpColor}
          bodyWeftColor={payload.bodyWeftColor}
          warpThickness={payload.fabricDesign?.weave.warpThickness}
          weftThickness={payload.fabricDesign?.weave.weftThickness}
          stripes={payload.fabricDesign?.stripes ?? []}
          submittedAt={payload.submittedAt}
          notes={payload.recipe.artisanNotes}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-emerald-950">{payload.recipe.artisanNotes}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="secondary" onClick={acceptAndOpenBuyerDashboard}>
            Accept design and open buyer dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}
