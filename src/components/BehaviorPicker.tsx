"use client";

import { BEHAVIORS } from "@/lib/behaviors";
import { cn } from "@/lib/utils";

interface BehaviorPickerProps {
  selected: string[];
  onChange: (codes: string[]) => void;
}

export function BehaviorPicker({ selected, onChange }: BehaviorPickerProps) {
  const toggle = (code: string) => {
    onChange(
      selected.includes(code)
        ? selected.filter((c) => c !== code)
        : [...selected, code]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {BEHAVIORS.map((b) => {
        const active = selected.includes(b.code);
        return (
          <button
            key={b.code}
            type="button"
            onClick={() => toggle(b.code)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
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
  );
}
