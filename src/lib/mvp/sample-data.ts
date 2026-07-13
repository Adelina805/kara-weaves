import type { MvpDataset } from "./types";

export const mvpData: MvpDataset = {
  products: [
    {
      id: "product-stole",
      name: "Handwoven stole",
      category: "stole",
      defaultWidthIn: 28,
      defaultLengthIn: 72,
    },
    {
      id: "product-swatch",
      name: "Sample swatch",
      category: "sampling",
      defaultWidthIn: 12,
      defaultLengthIn: 18,
    },
  ],
  colors: [
    {
      id: "color-ivory",
      name: "Natural ivory cotton",
      hexCode: "#f7f2e7",
      yarnCode: "KW-COT-IVORY-20S",
      material: "hand-spun cotton",
    },
    {
      id: "color-ecru",
      name: "Ecru cotton",
      hexCode: "#d9cfba",
      yarnCode: "KW-COT-ECRU-20S",
      material: "cotton",
    },
    {
      id: "color-rose",
      name: "Madder rose",
      hexCode: "#c84f87",
      yarnCode: "KW-NAT-MADDER-ROSE",
      material: "natural dyed cotton",
    },
    {
      id: "color-indigo",
      name: "Indigo blue",
      hexCode: "#25306d",
      yarnCode: "KW-NAT-INDIGO-20S",
      material: "natural dyed cotton",
    },
  ],
  cooperatives: [
    {
      id: "coop-kerala-01",
      name: "Chendamangalam Weaving Cooperative",
      location: "Kerala, India",
      story:
        "A cooperative of experienced handloom artisans preserving traditional cotton weaving skills while producing contemporary textiles for transparent supply chains.",
      contactName: "Production coordinator",
    },
  ],
  looms: [
    {
      id: "loom-cw-001",
      cooperativeId: "coop-kerala-01",
      loomCode: "CW-FRAME-001",
      loomName: "Frame loom 001",
      loomType: "handloom frame loom",
      maxWidthIn: 48,
    },
  ],
  loomSpecs: [
    {
      id: "spec-cotton-plain-28ppi",
      name: "Cotton handloom 28 PPI profile",
      loomId: "loom-cw-001",
      maxWeaveWidthIn: 44,
      reedDensityDpi: 48,
      defaultPpi: 28,
      minPpi: 20,
      maxPpi: 38,
      takeupPct: 0.08,
      shrinkagePct: 0.06,
      beatTensionNotes: "Medium beat. Check first 6 inches for density drift.",
      compatibilityNotes: "Suitable for stripe-based samples, loose weave swatches, plain weave, and waffle weave sampling.",
      isActive: true,
    },
  ],
  designs: [
    {
      id: "design-sample-001",
      title: "Rose edge loose-weave stole sample",
      productId: "product-stole",
      designerName: "Kara Weaves design team",
      loomSpecId: "spec-cotton-plain-28ppi",
      widthIn: 28,
      finishedLengthIn: 72,
      targetPpi: 28,
      status: "approved",
      notes:
        "MVP sample design: loose ivory body with rose edge accents, validated against a configurable loom/spec profile.",
      segments: [
        {
          id: "seg-001",
          sortOrder: 1,
          segmentType: "border",
          colorId: "color-rose",
          lengthIn: 2.5,
          repeatCount: 1,
          notes: "Opening rose accent",
        },
        {
          id: "seg-002",
          sortOrder: 2,
          segmentType: "body",
          colorId: "color-ivory",
          lengthIn: 30,
          repeatCount: 1,
          notes: "Loose weave ivory body",
        },
        {
          id: "seg-003",
          sortOrder: 3,
          segmentType: "stripe",
          colorId: "color-ecru",
          lengthIn: 7,
          repeatCount: 1,
          notes: "Subtle central tonal band",
        },
        {
          id: "seg-004",
          sortOrder: 4,
          segmentType: "body",
          colorId: "color-ivory",
          lengthIn: 30,
          repeatCount: 1,
          notes: "Loose weave ivory body",
        },
        {
          id: "seg-005",
          sortOrder: 5,
          segmentType: "border",
          colorId: "color-rose",
          lengthIn: 2.5,
          repeatCount: 1,
          notes: "Closing rose accent",
        },
      ],
    },
  ],
  orders: [
    {
      id: "order-kw-2401",
      orderCode: "KW-MVP-2401",
      designId: "design-sample-001",
      cooperativeId: "coop-kerala-01",
      loomId: "loom-cw-001",
      buyerDisplayName: "Pilot buyer",
      buyerPublicToken: "demo-buyer-token",
      status: "in_production",
      buyerMessage:
        "Your textile has been approved and assigned to a cooperative. The artisan team is preparing the loom setup.",
      publishedAt: "2026-07-01T09:30:00.000Z",
    },
  ],
  productionEvents: [
    {
      id: "event-001",
      orderId: "order-kw-2401",
      stage: "design_approved",
      statusLabel: "Design approved",
      notes: "Mockup and recipe approved for sampling.",
      visibleToBuyer: true,
      occurredAt: "2026-07-01T09:30:00.000Z",
    },
    {
      id: "event-002",
      orderId: "order-kw-2401",
      stage: "assigned_to_cooperative",
      statusLabel: "Assigned to cooperative",
      notes: "Assigned to Chendamangalam Weaving Cooperative.",
      visibleToBuyer: true,
      occurredAt: "2026-07-01T11:00:00.000Z",
    },
    {
      id: "event-003",
      orderId: "order-kw-2401",
      stage: "warping",
      statusLabel: "Warping started",
      notes: "Internal setup check: yarn count and reed density verified.",
      visibleToBuyer: false,
      occurredAt: "2026-07-02T10:15:00.000Z",
    },
    {
      id: "event-004",
      orderId: "order-kw-2401",
      stage: "on_loom",
      statusLabel: "On the loom",
      notes: "The sample is now on the loom.",
      visibleToBuyer: true,
      occurredAt: "2026-07-03T08:45:00.000Z",
    },
  ],
};

export function getPrimaryDesign() {
  return mvpData.designs[0];
}

export function getPrimaryOrder() {
  return mvpData.orders[0];
}
