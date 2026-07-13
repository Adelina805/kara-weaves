import { mvpData } from "./sample-data";
import type {
  ColorYarn,
  Cooperative,
  Design,
  Loom,
  LoomSpec,
  Order,
  ProductionEvent,
  RecipePick,
  TechnicalRecipe,
  ValidationResult,
} from "./types";

export function findProduct(design: Design) {
  return mvpData.products.find((product) => product.id === design.productId);
}

export function findLoomSpec(design: Design): LoomSpec {
  const loomSpec = mvpData.loomSpecs.find((spec) => spec.id === design.loomSpecId);

  if (!loomSpec) {
    throw new Error(`Missing loom spec for design ${design.id}`);
  }

  return loomSpec;
}

export function findLoom(loomId: string): Loom {
  const loom = mvpData.looms.find((item) => item.id === loomId);

  if (!loom) {
    throw new Error(`Missing loom ${loomId}`);
  }

  return loom;
}

export function findCooperative(cooperativeId: string): Cooperative {
  const cooperative = mvpData.cooperatives.find((item) => item.id === cooperativeId);

  if (!cooperative) {
    throw new Error(`Missing cooperative ${cooperativeId}`);
  }

  return cooperative;
}

export function findColor(colorId: string): ColorYarn {
  const color = mvpData.colors.find((item) => item.id === colorId);

  if (!color) {
    throw new Error(`Missing color ${colorId}`);
  }

  return color;
}

export function validateDesign(design: Design): ValidationResult[] {
  const loomSpec = findLoomSpec(design);
  const results: ValidationResult[] = [];

  if (!loomSpec.isActive) {
    results.push({
      ruleCode: "INACTIVE_LOOM_SPEC",
      severity: "error",
      message: "The selected loom/spec profile is inactive and cannot be used for a new approval.",
    });
  }

  if (design.widthIn > loomSpec.maxWeaveWidthIn) {
    results.push({
      ruleCode: "WIDTH_EXCEEDS_LOOM",
      severity: "error",
      message: `Design width ${design.widthIn} in exceeds loom/spec capacity ${loomSpec.maxWeaveWidthIn} in.`,
      measuredValue: design.widthIn,
      expectedMax: loomSpec.maxWeaveWidthIn,
    });
  } else {
    results.push({
      ruleCode: "WIDTH_WITHIN_LOOM",
      severity: "info",
      message: `Design width ${design.widthIn} in fits the selected loom/spec capacity.`,
      measuredValue: design.widthIn,
      expectedMax: loomSpec.maxWeaveWidthIn,
    });
  }

  if (design.targetPpi < loomSpec.minPpi) {
    results.push({
      ruleCode: "PPI_BELOW_MIN",
      severity: "warning",
      message: `Target PPI ${design.targetPpi} is below the recommended minimum ${loomSpec.minPpi}.`,
      measuredValue: design.targetPpi,
      expectedMin: loomSpec.minPpi,
    });
  }

  if (design.targetPpi > loomSpec.maxPpi) {
    results.push({
      ruleCode: "PPI_ABOVE_MAX",
      severity: "warning",
      message: `Target PPI ${design.targetPpi} is above the recommended maximum ${loomSpec.maxPpi}.`,
      measuredValue: design.targetPpi,
      expectedMax: loomSpec.maxPpi,
    });
  }

  if (design.targetPpi >= loomSpec.minPpi && design.targetPpi <= loomSpec.maxPpi) {
    results.push({
      ruleCode: "PPI_IN_RANGE",
      severity: "info",
      message: `Target PPI ${design.targetPpi} is inside the configured range ${loomSpec.minPpi}-${loomSpec.maxPpi}.`,
      measuredValue: design.targetPpi,
      expectedMin: loomSpec.minPpi,
      expectedMax: loomSpec.maxPpi,
    });
  }

  const segmentLength = design.segments.reduce(
    (total, segment) => total + segment.lengthIn * segment.repeatCount,
    0,
  );

  if (Math.abs(segmentLength - design.finishedLengthIn) > 0.25) {
    results.push({
      ruleCode: "SEGMENT_TOTAL_MISMATCH",
      severity: "warning",
      message: `Stripe/block segment total ${segmentLength.toFixed(2)} in differs from finished length ${design.finishedLengthIn.toFixed(2)} in.`,
      measuredValue: segmentLength,
      expectedMax: design.finishedLengthIn,
    });
  } else {
    results.push({
      ruleCode: "SEGMENT_TOTAL_MATCH",
      severity: "info",
      message: "Stripe/block segment lengths match the finished length.",
      measuredValue: segmentLength,
      expectedMax: design.finishedLengthIn,
    });
  }

  for (const segment of design.segments) {
    const color = findColor(segment.colorId);

    if (!color.yarnCode) {
      results.push({
        ruleCode: "MISSING_YARN_CODE",
        severity: "warning",
        message: `${color.name} is missing a yarn code or material mapping.`,
      });
    }
  }

  return results;
}

export function generateTechnicalRecipe(design: Design): TechnicalRecipe {
  const loomSpec = findLoomSpec(design);

  const pickSequence: RecipePick[] = design.segments.map((segment) => {
    const color = findColor(segment.colorId);
    return {
      sortOrder: segment.sortOrder,
      segmentType: segment.segmentType,
      colorName: color.name,
      hexCode: color.hexCode,
      yarnCode: color.yarnCode ?? "NEEDS-YARN-CODE",
      lengthIn: segment.lengthIn,
      calculatedPicks: Math.round(segment.lengthIn * design.targetPpi) * segment.repeatCount,
      repeatCount: segment.repeatCount,
    };
  });

  const totalPicks = pickSequence.reduce((total, item) => total + item.calculatedPicks, 0);
  const estimatedOnLoomLengthIn = Number(
    (design.finishedLengthIn * (1 + loomSpec.takeupPct + loomSpec.shrinkagePct)).toFixed(2),
  );

  return {
    designId: design.id,
    version: 1,
    totalPicks,
    estimatedOnLoomLengthIn,
    pickSequence,
    setupSummary: {
      loomSpecName: loomSpec.name,
      widthIn: design.widthIn,
      targetPpi: design.targetPpi,
      reedDensityDpi: loomSpec.reedDensityDpi,
      takeupPct: loomSpec.takeupPct,
      shrinkagePct: loomSpec.shrinkagePct,
    },
    artisanNotes:
      "Use this card as the current recipe. Confirm yarn codes, warp width, first 6 inches of beat consistency, and record any production deviations before approval.",
  };
}

export function hasBlockingValidationErrors(results: ValidationResult[]) {
  return results.some((result) => result.severity === "error");
}

export function getBuyerSafeEvents(order: Order): ProductionEvent[] {
  return mvpData.productionEvents
    .filter((event) => event.orderId === order.id && event.visibleToBuyer)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

export function getInternalEvents(order: Order): ProductionEvent[] {
  return mvpData.productionEvents
    .filter((event) => event.orderId === order.id)
    .sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

export function buyerStageLabel(stage: ProductionEvent["stage"]): string {
  if (stage === "design_approved") return "Design approved";
  if (stage === "assigned_to_cooperative") return "Assigned to cooperative";
  if (stage === "warping" || stage === "on_loom" || stage === "weaving") return "On the loom";
  if (stage === "finishing" || stage === "quality_check") return "Finishing and quality check";
  if (stage === "ready" || stage === "delivered") return "Ready / Delivered";
  return "In progress";
}

export function buildMockupSvg(design: Design, options: { width?: number; height?: number } = {}) {
  const width = options.width ?? 760;
  const height = options.height ?? 360;
  const totalLength = design.segments.reduce(
    (total, segment) => total + segment.lengthIn * segment.repeatCount,
    0,
  );

  let cursor = 0;
  const stripeRects = design.segments
    .map((segment) => {
      const color = findColor(segment.colorId);
      const segmentHeight = Math.max(1, (segment.lengthIn * segment.repeatCount * height) / totalLength);
      const rect = `<rect x="0" y="${cursor.toFixed(2)}" width="${width}" height="${segmentHeight.toFixed(2)}" fill="${color.hexCode}" />`;
      cursor += segmentHeight;
      return rect;
    })
    .join("\n");

  const warpLines = Array.from({ length: 48 }, (_, index) => {
    const x = (index * width) / 47;
    const alpha = index % 2 === 0 ? 0.16 : 0.08;
    return `<line x1="${x.toFixed(2)}" y1="0" x2="${x.toFixed(2)}" y2="${height}" stroke="#4a4035" stroke-opacity="${alpha}" stroke-width="1" />`;
  }).join("\n");

  const weftLines = Array.from({ length: 32 }, (_, index) => {
    const y = (index * height) / 31;
    const alpha = index % 2 === 0 ? 0.12 : 0.06;
    return `<line x1="0" y1="${y.toFixed(2)}" x2="${width}" y2="${y.toFixed(2)}" stroke="#ffffff" stroke-opacity="${alpha}" stroke-width="1" />`;
  }).join("\n");

  return `
<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Generated textile mockup" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#2b2119" flood-opacity="0.14" />
    </filter>
  </defs>
  <rect x="0" y="0" width="${width}" height="${height}" rx="26" fill="#f8f4ed" filter="url(#softShadow)" />
  <g clip-path="inset(0 round 26px)">
    ${stripeRects}
    ${warpLines}
    ${weftLines}
    <rect x="0" y="0" width="${width}" height="${height}" fill="none" stroke="#3f3328" stroke-opacity="0.18" stroke-width="2" />
  </g>
</svg>`.trim();
}
