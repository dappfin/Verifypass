"use client"

import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAX_SEATS, SEAT_PRESETS } from "@/lib/trustpass-data"

export function SeatCounter({
  value,
  onChange,
}: {
  value: number
  onChange: (next: number) => void
}) {
  const clamp = (n: number) => Math.max(1, Math.min(MAX_SEATS, n))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Decrease seats"
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= 1}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-secondary text-foreground transition-colors active:bg-muted disabled:opacity-40"
        >
          <Minus className="h-7 w-7" aria-hidden="true" />
        </button>

        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
            {value}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Seats
          </span>
        </div>

        <button
          type="button"
          aria-label="Increase seats"
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= MAX_SEATS}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-colors active:opacity-90 disabled:opacity-40"
        >
          <Plus className="h-7 w-7" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {SEAT_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              "rounded-xl border py-2.5 text-sm font-semibold transition-colors",
              value === preset
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground active:bg-secondary",
            )}
          >
            {preset}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(MAX_SEATS)}
          className={cn(
            "rounded-xl border py-2.5 text-sm font-semibold transition-colors",
            value === MAX_SEATS
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground active:bg-secondary",
          )}
        >
          Max
        </button>
      </div>
    </div>
  )
}
