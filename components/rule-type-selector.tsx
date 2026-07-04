"use client"

import { Infinity as InfinityIcon, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RuleType } from "@/lib/trustpass-data"

const OPTIONS: { key: RuleType; label: string; icon: typeof Clock }[] = [
  { key: "lifetime", label: "Lifetime", icon: InfinityIcon },
  { key: "one-time", label: "One-Time", icon: Zap },
  { key: "time-limited", label: "Time-Limited", icon: Clock },
]

export function RuleTypeSelector({
  value,
  onChange,
}: {
  value: RuleType
  onChange: (next: RuleType) => void
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const isActive = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.key)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3.5 text-center transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground active:bg-secondary",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="text-xs font-semibold leading-tight">
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
