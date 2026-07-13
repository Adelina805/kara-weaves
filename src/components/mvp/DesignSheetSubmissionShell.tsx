"use client";

import { useState } from "react";
import { FabricDesignerApp } from "@/components/fabric-designer/FabricDesignerApp";
import { DesignSubmissionFlow } from "@/components/mvp/DesignSubmissionFlow";
import { Button } from "@/components/ui/Button";

export function DesignSheetSubmissionShell() {
  const [isSubmitWorkflowOpen, setIsSubmitWorkflowOpen] = useState(false);

  return (
    <FabricDesignerApp
      workflowControls={() => (
        <Button fullWidth className="mt-2" onClick={() => setIsSubmitWorkflowOpen(true)}>
          Submit and Validate
        </Button>
      )}
      workflowOverlay={(design) =>
        isSubmitWorkflowOpen ? (
          <DesignSubmissionFlow
            fabricDesign={design}
            onClose={() => setIsSubmitWorkflowOpen(false)}
          />
        ) : null
      }
    />
  );
}
