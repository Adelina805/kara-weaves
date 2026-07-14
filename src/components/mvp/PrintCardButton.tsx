"use client";

import { Button } from "@/components/ui/Button";

type PrintCardButtonProps = {
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "danger";
  targetId?: string;
};

function cleanupPrintPortal() {
  document.body.classList.remove("printing-artisan-card");
  document.getElementById("artisan-print-portal")?.remove();
}

export function PrintCardButton({
  label = "Print card",
  className = "",
  variant = "primary",
  targetId,
}: PrintCardButtonProps) {
  function handlePrint() {
    if (!targetId) {
      window.print();
      return;
    }

    const target = document.getElementById(targetId);

    if (!target) {
      window.print();
      return;
    }

    cleanupPrintPortal();

    const portal = document.createElement("div");
    portal.id = "artisan-print-portal";
    portal.className = "artisan-print-portal";
    portal.innerHTML = target.outerHTML;
    document.body.appendChild(portal);
    document.body.classList.add("printing-artisan-card");

    const afterPrint = () => {
      cleanupPrintPortal();
      window.removeEventListener("afterprint", afterPrint);
    };

    window.addEventListener("afterprint", afterPrint);

    window.requestAnimationFrame(() => {
      window.print();
      window.setTimeout(cleanupPrintPortal, 800);
    });
  }

  return (
    <Button variant={variant} onClick={handlePrint} className={className}>
      {label}
    </Button>
  );
}
