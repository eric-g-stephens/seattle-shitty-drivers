"use client";

import { BEHAVIORS } from "@/lib/behaviors";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

interface BehaviorPickerProps {
  selected: string[];
  onChange: (codes: string[]) => void;
}

export function BehaviorPicker({ selected, onChange }: BehaviorPickerProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = (code: string) => {
    onChange(
      selected.includes(code)
        ? selected.filter((c) => c !== code)
        : [...selected, code]
    );
  };

  const handlePress = (code: string) => (e: React.PointerEvent<HTMLButtonElement>) => {
    // Mobile Safari can be finicky with click events inside forms; pointer events are more reliable.
    e.preventDefault();
    toggle(code);
  };

  const visible = useMemo(() => {
    // Mobile-first: show a smaller initial set; still show all selected items.
    const base = expanded ? BEHAVIORS : BEHAVIORS.slice(0, 10);
    const selectedSet = new Set(selected);
    const selectedExtras = BEHAVIORS.filter((b) => selectedSet.has(b.code) && !base.some((x) => x.code === b.code));
    return [...selectedExtras, ...base];
  }, [expanded, selected]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {visible.map((b) => {
        const active = selected.includes(b.code);
        return (
          <button
            key={b.code}
            type="button"
            aria-pressed={active}
            onPointerDown={handlePress(b.code)}
            className={cn(
              "min-h-9 rounded-full border px-3 py-1 text-xs transition-colors sm:text-sm",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {b.label}
          </button>
        );
        })}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {expanded ? "Show fewer" : "Show all behaviors"}
      </button>
    </div>
  );
}
