"use client";

import { useEffect, useState } from "react";
import { MockupPreview } from "@/components/mvp/MockupPreview";
import { readSubmittedDesigns } from "@/lib/mvp/submissions";

export function BuyerMockupPreview({
  fallbackSvg,
  token,
  label,
}: {
  fallbackSvg: string;
  token: string;
  label: string;
}) {
  const [svg, setSvg] = useState(fallbackSvg);

  useEffect(() => {
    const latestAccepted = readSubmittedDesigns().find(
      (payload) => payload.accepted && payload.buyerToken === token && payload.mockupSvg,
    );

    setSvg(latestAccepted?.mockupSvg ?? fallbackSvg);
  }, [fallbackSvg, token]);

  return <MockupPreview svg={svg} label={label} />;
}
