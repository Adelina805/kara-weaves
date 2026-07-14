import type { FabricDesign } from "@/lib/fabric";
import type { TechnicalRecipe, ValidationResult } from "@/lib/mvp/types";

export const CURRENT_SUBMISSION_STORAGE_KEY = "kara-weaves-submitted-design";
export const SUBMISSION_HISTORY_STORAGE_KEY = "kara-weaves-submitted-designs";

export type SubmittedRecipePayload = {
  id: string;
  submittedAt: string;
  acceptedAt?: string;
  accepted: boolean;
  buyerToken: string;
  designTitle: string;
  weaveType: FabricDesign["weaveType"];
  verticalStripeCount: number;
  horizontalStripeCount: number;
  bodyWarpColor: string;
  bodyWeftColor: string;
  fabricDesign?: FabricDesign;
  mockupSvg?: string;
  validation: ValidationResult[];
  recipe: TechnicalRecipe;
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readSubmittedDesigns(): SubmittedRecipePayload[] {
  if (!canUseStorage()) return [];

  const rawHistory = window.localStorage.getItem(SUBMISSION_HISTORY_STORAGE_KEY);

  if (rawHistory) {
    try {
      const parsed = JSON.parse(rawHistory) as SubmittedRecipePayload[];
      return Array.isArray(parsed)
        ? parsed.filter((item) => item && typeof item.id === "string")
        : [];
    } catch {
      return [];
    }
  }

  const legacyPayload = window.localStorage.getItem(CURRENT_SUBMISSION_STORAGE_KEY);
  if (!legacyPayload) return [];

  try {
    const parsed = JSON.parse(legacyPayload) as SubmittedRecipePayload;
    if (!parsed || typeof parsed !== "object") return [];

    return [
      {
        ...parsed,
        id: parsed.id ?? `legacy-${parsed.submittedAt ?? Date.now()}`,
      },
    ];
  } catch {
    return [];
  }
}

export function saveSubmittedDesigns(items: SubmittedRecipePayload[]) {
  if (!canUseStorage()) return [];

  const sorted = [...items].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  window.localStorage.setItem(SUBMISSION_HISTORY_STORAGE_KEY, JSON.stringify(sorted));
  return sorted;
}

export function setCurrentSubmission(payload: SubmittedRecipePayload) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CURRENT_SUBMISSION_STORAGE_KEY, JSON.stringify(payload));
}

export function readCurrentSubmission(): SubmittedRecipePayload | null {
  if (!canUseStorage()) return null;

  const rawPayload = window.localStorage.getItem(CURRENT_SUBMISSION_STORAGE_KEY);
  if (!rawPayload) return null;

  try {
    const parsed = JSON.parse(rawPayload) as SubmittedRecipePayload;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      ...parsed,
      id: parsed.id ?? `legacy-${parsed.submittedAt ?? Date.now()}`,
    };
  } catch {
    return null;
  }
}

export function upsertSubmittedDesign(payload: SubmittedRecipePayload) {
  const current = readSubmittedDesigns();
  const index = current.findIndex((item) => item.id === payload.id);
  const next = [...current];

  if (index >= 0) {
    next[index] = payload;
  } else {
    next.unshift(payload);
  }

  const saved = saveSubmittedDesigns(next);
  setCurrentSubmission(payload);
  return saved;
}

export function markSubmissionAccepted(id: string, acceptedAt = new Date().toISOString()) {
  const current = readSubmittedDesigns();
  const updated = current.map((item) =>
    item.id === id
      ? {
          ...item,
          accepted: true,
          acceptedAt,
        }
      : item,
  );

  const saved = saveSubmittedDesigns(updated);
  const acceptedPayload = saved.find((item) => item.id === id);
  if (acceptedPayload) {
    setCurrentSubmission(acceptedPayload);
  }

  return saved;
}
