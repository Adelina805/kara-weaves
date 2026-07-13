"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { MockupPreview } from "@/components/mvp/MockupPreview";
import { StatusPill } from "@/components/mvp/StatusPill";
import { getPrimaryOrder, mvpData } from "@/lib/mvp/sample-data";
import { findLoomSpec, hasBlockingValidationErrors } from "@/lib/mvp/rules";
import { buildFabricDesignMockupSvg } from "@/lib/mvp/design-mockup";
import type { FabricDesign, Stripe } from "@/lib/fabric";
import type { RecipePick, TechnicalRecipe, ValidationResult } from "@/lib/mvp/types";
import {
  readSubmittedDesigns,
  upsertSubmittedDesign,
  type SubmittedRecipePayload,
} from "@/lib/mvp/submissions";

type SubmissionStage = "idle" | "generated" | "blocked" | "accepted";

const DESIGN_WIDTH_IN = 28;
const DESIGN_LENGTH_IN = 72;
const TARGET_PPI = 28;

function titleForWeave(weaveType: FabricDesign["weaveType"]) {
  if (weaveType === "loose") return "Submitted loose-weave textile design";
  if (weaveType === "waffle") return "Submitted waffle-weave textile design";
  return "Submitted plain-weave textile design";
}

function yarnCodeFromColor(hex: string) {
  return `CUSTOM-${hex.replace("#", "").toUpperCase()}`;
}

function segmentLengthFromPixels(value: number, outputSize: number) {
  return Number(((value / outputSize) * DESIGN_LENGTH_IN).toFixed(2));
}

function buildRecipeSegments(fabricDesign: FabricDesign): RecipePick[] {
  const horizontalStripes = fabricDesign.stripes
    .filter((stripe) => stripe.orientation === "horizontal")
    .sort((a, b) => a.position - b.position);

  const segments: RecipePick[] = [];
  let cursorPx = 0;
  let sortOrder = 1;

  function pushSegment(segmentType: "body" | "stripe" | "border", lengthIn: number, hexCode: string, colorName: string) {
    if (lengthIn <= 0.05) return;

    segments.push({
      sortOrder,
      segmentType,
      colorName,
      hexCode,
      yarnCode: yarnCodeFromColor(hexCode),
      lengthIn: Number(lengthIn.toFixed(2)),
      calculatedPicks: Math.round(lengthIn * TARGET_PPI),
      repeatCount: 1,
    });
    sortOrder += 1;
  }

  if (horizontalStripes.length === 0) {
    pushSegment("body", DESIGN_LENGTH_IN, fabricDesign.body.weftColor, "Body weft yarn");
    return segments;
  }

  for (const stripe of horizontalStripes) {
    const stripeStart = Math.max(0, Math.min(fabricDesign.outputSize, stripe.position));
    const stripeEnd = Math.max(stripeStart, Math.min(fabricDesign.outputSize, stripe.position + stripe.width));

    if (stripeStart > cursorPx) {
      pushSegment(
        "body",
        segmentLengthFromPixels(stripeStart - cursorPx, fabricDesign.outputSize),
        fabricDesign.body.weftColor,
        "Body weft yarn",
      );
    }

    pushSegment(
      "stripe",
      segmentLengthFromPixels(stripeEnd - stripeStart, fabricDesign.outputSize),
      stripe.weftColor,
      "Custom horizontal stripe yarn",
    );

    cursorPx = Math.max(cursorPx, stripeEnd);
  }

  if (cursorPx < fabricDesign.outputSize) {
    pushSegment(
      "body",
      segmentLengthFromPixels(fabricDesign.outputSize - cursorPx, fabricDesign.outputSize),
      fabricDesign.body.weftColor,
      "Body weft yarn",
    );
  }

  return segments;
}

function buildSubmittedRecipe(fabricDesign: FabricDesign): { validation: ValidationResult[]; recipe: TechnicalRecipe } {
  const primaryDesign = mvpData.designs[0];
  const loomSpec = findLoomSpec(primaryDesign);
  const validation: ValidationResult[] = [];

  if (!loomSpec.isActive) {
    validation.push({
      ruleCode: "INACTIVE_LOOM_SPEC",
      severity: "error",
      message: "The selected loom/spec profile is inactive and cannot be used for approval.",
    });
  }

  if (DESIGN_WIDTH_IN > loomSpec.maxWeaveWidthIn) {
    validation.push({
      ruleCode: "WIDTH_EXCEEDS_LOOM",
      severity: "error",
      message: `Design width ${DESIGN_WIDTH_IN} in exceeds loom capacity ${loomSpec.maxWeaveWidthIn} in.`,
      measuredValue: DESIGN_WIDTH_IN,
      expectedMax: loomSpec.maxWeaveWidthIn,
    });
  } else {
    validation.push({
      ruleCode: "WIDTH_WITHIN_LOOM",
      severity: "info",
      message: `Design width ${DESIGN_WIDTH_IN} in fits the selected loom/spec capacity.`,
      measuredValue: DESIGN_WIDTH_IN,
      expectedMax: loomSpec.maxWeaveWidthIn,
    });
  }

  if (TARGET_PPI < loomSpec.minPpi) {
    validation.push({
      ruleCode: "PPI_BELOW_MIN",
      severity: "warning",
      message: `Target PPI ${TARGET_PPI} is below the recommended minimum ${loomSpec.minPpi}.`,
      measuredValue: TARGET_PPI,
      expectedMin: loomSpec.minPpi,
    });
  } else if (TARGET_PPI > loomSpec.maxPpi) {
    validation.push({
      ruleCode: "PPI_ABOVE_MAX",
      severity: "warning",
      message: `Target PPI ${TARGET_PPI} is above the recommended maximum ${loomSpec.maxPpi}.`,
      measuredValue: TARGET_PPI,
      expectedMax: loomSpec.maxPpi,
    });
  } else {
    validation.push({
      ruleCode: "PPI_IN_RANGE",
      severity: "info",
      message: `Target PPI ${TARGET_PPI} is inside the configured range ${loomSpec.minPpi}-${loomSpec.maxPpi}.`,
      measuredValue: TARGET_PPI,
      expectedMin: loomSpec.minPpi,
      expectedMax: loomSpec.maxPpi,
    });
  }

  const pickSequence = buildRecipeSegments(fabricDesign);
  const segmentTotal = Number(pickSequence.reduce((sum, item) => sum + item.lengthIn, 0).toFixed(2));

  if (Math.abs(segmentTotal - DESIGN_LENGTH_IN) > 0.25) {
    validation.push({
      ruleCode: "SEGMENT_TOTAL_MISMATCH",
      severity: "warning",
      message: `Stripe/block segment total ${segmentTotal} in differs from finished length ${DESIGN_LENGTH_IN} in.`,
      measuredValue: segmentTotal,
      expectedMax: DESIGN_LENGTH_IN,
    });
  } else {
    validation.push({
      ruleCode: "SEGMENT_TOTAL_MATCH",
      severity: "info",
      message: "Stripe/block segment lengths match the finished length.",
      measuredValue: segmentTotal,
      expectedMax: DESIGN_LENGTH_IN,
    });
  }

  validation.push({
    ruleCode: "WEAVE_STRUCTURE_SELECTED",
    severity: "info",
    message: `${fabricDesign.weaveType} weave selected from the live design sheet.` ,
  });

  const verticalStripeCount = fabricDesign.stripes.filter((stripe: Stripe) => stripe.orientation === "vertical").length;
  if (verticalStripeCount > 0) {
    validation.push({
      ruleCode: "VERTICAL_STRIPES_RECORDED",
      severity: "info",
      message: `${verticalStripeCount} vertical stripe(s) are included in the mockup and noted for warp setup.`,
    });
  }

  const totalPicks = pickSequence.reduce((sum, item) => sum + item.calculatedPicks, 0);
  const estimatedOnLoomLengthIn = Number(
    (DESIGN_LENGTH_IN * (1 + loomSpec.takeupPct + loomSpec.shrinkagePct)).toFixed(2),
  );

  const recipe: TechnicalRecipe = {
    designId: "submitted-design-live-sheet",
    version: 1,
    totalPicks,
    estimatedOnLoomLengthIn,
    pickSequence,
    setupSummary: {
      loomSpecName: loomSpec.name,
      widthIn: DESIGN_WIDTH_IN,
      targetPpi: TARGET_PPI,
      reedDensityDpi: loomSpec.reedDensityDpi,
      takeupPct: loomSpec.takeupPct,
      shrinkagePct: loomSpec.shrinkagePct,
    },
    artisanNotes: `Generated from the live design sheet. Weave type: ${fabricDesign.weaveType}. Confirm yarn codes, warp width, first 6 inches of beat consistency, and any vertical stripe setup before production.`,
  };

  return { validation, recipe };
}

export function DesignSubmissionFlow({
  fabricDesign,
  onClose,
}: {
  fabricDesign: FabricDesign;
  onClose?: () => void;
}) {
  const router = useRouter();
  const order = getPrimaryOrder();
  const submittedTitle = titleForWeave(fabricDesign.weaveType);
  const mockupSvg = useMemo(
    () => buildFabricDesignMockupSvg(fabricDesign, { width: 520, height: 520 }),
    [fabricDesign],
  );

  const [stage, setStage] = useState<SubmissionStage>("idle");
  const [validation, setValidation] = useState<ValidationResult[]>([]);
  const [recipe, setRecipe] = useState<TechnicalRecipe | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [submissionHistory, setSubmissionHistory] = useState<SubmittedRecipePayload[]>([]);

  useEffect(() => {
    setSubmissionHistory(readSubmittedDesigns());
  }, []);

  const hasErrors = validation.length > 0 && hasBlockingValidationErrors(validation);
  const verticalStripeCount = fabricDesign.stripes.filter((stripe) => stripe.orientation === "vertical").length;
  const horizontalStripeCount = fabricDesign.stripes.filter((stripe) => stripe.orientation === "horizontal").length;

  function persistSubmission(payload: SubmittedRecipePayload) {
    const nextHistory = upsertSubmittedDesign(payload);
    setSubmissionHistory(nextHistory);
  }

  function buildSubmissionPayload({
    id,
    accepted,
    result,
  }: {
    id: string;
    accepted: boolean;
    result: { validation: ValidationResult[]; recipe: TechnicalRecipe };
  }): SubmittedRecipePayload {
    const now = new Date().toISOString();

    return {
      id,
      submittedAt: now,
      acceptedAt: accepted ? now : undefined,
      accepted,
      buyerToken: order.buyerPublicToken,
      designTitle: submittedTitle,
      weaveType: fabricDesign.weaveType,
      verticalStripeCount,
      horizontalStripeCount,
      bodyWarpColor: fabricDesign.body.warpColor,
      bodyWeftColor: fabricDesign.body.weftColor,
      fabricDesign,
      mockupSvg,
      validation: result.validation,
      recipe: result.recipe,
    };
  }

  function handleSubmitDesign() {
    const result = buildSubmittedRecipe(fabricDesign);
    const hasBlockingErrors = hasBlockingValidationErrors(result.validation);

    setValidation(result.validation);

    if (hasBlockingErrors) {
      setRecipe(null);
      setStage("blocked");
      return;
    }

    setRecipe(result.recipe);
    setStage("generated");

    const submissionId = `SUB-${Date.now()}`;
    setActiveSubmissionId(submissionId);
    persistSubmission(buildSubmissionPayload({
      id: submissionId,
      accepted: false,
      result,
    }));
  }

  function handleAcceptDesign() {
    const result = recipe ? { validation, recipe } : buildSubmittedRecipe(fabricDesign);

    const submissionId = activeSubmissionId ?? `SUB-${Date.now()}`;
    setActiveSubmissionId(submissionId);
    persistSubmission(buildSubmissionPayload({
      id: submissionId,
      accepted: true,
      result,
    }));

    setStage("accepted");
    router.push(`/buyer-dashboard/${order.buyerPublicToken}?accepted=1`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <section className="max-h-[calc(100vh-2rem)] w-[min(680px,calc(100vw-2rem))] overflow-y-auto rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">Submit Workflow</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Validate input and generate recipe</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill
            label={stage === "idle" ? "draft" : stage === "blocked" ? "blocked" : stage === "accepted" ? "accepted" : "recipe ready"}
            severity={stage === "blocked" ? "error" : "info"}
          />
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-xl font-bold leading-none text-stone-500 transition hover:border-stone-400 hover:text-stone-950"
              aria-label="Close submit workflow"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        This submit button reads the current design-sheet settings, validates them against the loom/spec rules, stores a generated artisan recipe card, and opens the buyer dashboard only after acceptance.
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
        <MockupPreview svg={mockupSvg} label="Submitted design mockup" />
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between rounded-2xl bg-stone-50 p-3">
          <span className="font-bold text-stone-600">Design</span>
          <span className="text-right text-stone-950">{submittedTitle}</span>
        </div>
        <div className="flex justify-between rounded-2xl bg-stone-50 p-3">
          <span className="font-bold text-stone-600">Weave</span>
          <span className="capitalize text-stone-950">{fabricDesign.weaveType}</span>
        </div>
        <div className="flex justify-between rounded-2xl bg-stone-50 p-3">
          <span className="font-bold text-stone-600">Stripes</span>
          <span className="text-stone-950">{verticalStripeCount} vertical · {horizontalStripeCount} horizontal</span>
        </div>
        <div className="flex justify-between rounded-2xl bg-stone-50 p-3">
          <span className="font-bold text-stone-600">Dimensions</span>
          <span className="text-stone-950">{DESIGN_WIDTH_IN} in × {DESIGN_LENGTH_IN} in</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button fullWidth onClick={handleSubmitDesign}>
          Submit design for validation
        </Button>
        {onClose ? (
          <Button fullWidth variant="danger" onClick={onClose}>
            Cancel / Close
          </Button>
        ) : null}
      </div>

      {validation.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Validation Results</p>
            <StatusPill label={hasErrors ? "fix required" : "passed"} severity={hasErrors ? "error" : "info"} />
          </div>
          <div className="mt-3 space-y-2">
            {validation.map((result) => (
              <div key={result.ruleCode} className="rounded-xl bg-white p-3 text-xs leading-5 text-stone-600">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-stone-950">{result.ruleCode}</strong>
                  <StatusPill label={result.severity} severity={result.severity} />
                </div>
                <p className="mt-2">{result.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {recipe ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Artisan recipe generated</p>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex justify-between"><span>Total picks</span><strong>{recipe.totalPicks}</strong></div>
            <div className="flex justify-between"><span>On-loom length</span><strong>{recipe.estimatedOnLoomLengthIn} in</strong></div>
            <div className="flex justify-between"><span>Recipe version</span><strong>v{recipe.version}</strong></div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a
              href="/artisan-recipe?generated=1"
              className="rounded-lg border border-emerald-300 bg-white px-4 py-2.5 text-center text-sm font-bold text-emerald-800 transition hover:border-emerald-500"
            >
              Open recipe card
            </a>
            <Button variant="secondary" onClick={handleAcceptDesign}>
              Accept design
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-emerald-900">
            Acceptance opens the buyer dashboard with the approved mockup, cooperative story, and buyer-safe production milestones.
          </p>
        </div>
      ) : null}

      {stage === "blocked" ? (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900">
          The recipe card was not generated because the design has a blocking validation error. Fix the design values and submit again.
        </p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">Submitted design history</p>
            <p className="mt-1 text-xs text-stone-500">All submitted designs are retained locally for this MVP session.</p>
          </div>
          <StatusPill label={`${submissionHistory.length} saved`} severity="info" />
        </div>

        {submissionHistory.length > 0 ? (
          <div className="mt-3 max-h-60 overflow-auto rounded-xl border border-stone-100">
            <table className="w-full min-w-[620px] border-collapse text-left text-xs">
              <thead className="bg-stone-50 uppercase tracking-[0.16em] text-stone-500">
                <tr>
                  <th className="px-3 py-2">Submitted</th>
                  <th className="px-3 py-2">Weave</th>
                  <th className="px-3 py-2">Stripes</th>
                  <th className="px-3 py-2">Picks</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {submissionHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-medium text-stone-700">
                      {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.submittedAt))}
                    </td>
                    <td className="px-3 py-2 capitalize">{item.weaveType}</td>
                    <td className="px-3 py-2">{item.verticalStripeCount} V · {item.horizontalStripeCount} H</td>
                    <td className="px-3 py-2 font-bold">{item.recipe.totalPicks}</td>
                    <td className="px-3 py-2">
                      <StatusPill label={item.accepted ? "accepted" : "submitted"} severity="info" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-500">No submitted designs yet. Submit this design to add the first retained row.</p>
        )}
      </div>
      </section>
    </div>
  );
}
