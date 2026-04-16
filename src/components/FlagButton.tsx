"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FlagButton({ reportId }: { reportId: string }) {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");

  const flag = async () => {
    if (state !== "idle") return;
    const res = await fetch("/api/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId }),
    });
    setState(res.ok ? "done" : "error");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={flag}
      disabled={state !== "idle"}
      title="Flag this report as inaccurate"
      className="text-muted-foreground hover:text-destructive h-7 px-2"
    >
      <Flag className="h-3 w-3" />
      {state === "done" && <span className="ml-1 text-xs">Flagged</span>}
      {state === "error" && <span className="ml-1 text-xs">Error</span>}
    </Button>
  );
}
