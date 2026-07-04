"use client"

import { BookOpen, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  RULE_TYPE_LABELS,
  type ProtectedGate,
} from "@/lib/trustpass-data"

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

// Parse the wall-clock components of a `datetime-local` string
// ("YYYY-MM-DDTHH:mm") directly, WITHOUT constructing a Date. Passing such a
// string to `new Date()` interprets it in the runtime's local timezone, which
// differs between the server (UTC) and the client, producing a hydration
// mismatch. Formatting the raw components makes the output deterministic.
function formatWindow(value?: string) {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value)
  if (!match) return value
  const [, , month, day, hour, minute] = match
  const monthLabel = MONTHS[Number(month) - 1] ?? month
  const h = Number(hour)
  const period = h >= 12 ? "PM" : "AM"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${monthLabel} ${Number(day)}, ${hour12}:${minute} ${period}`
}

export function GateCard({
  gate,
  onRevoke,
}: {
  gate: ProtectedGate
  onRevoke: (id: string) => void
}) {
  const pct = Math.min(
    100,
    Math.round((gate.seatsFilled / gate.seatCapacity) * 100),
  )
  const isFull = gate.seatsFilled >= gate.seatCapacity

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-foreground">
            {gate.nameNotice}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{gate.contentName}</span>
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            gate.ruleType === "time-limited"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-secondary-foreground",
          )}
        >
          {RULE_TYPE_LABELS[gate.ruleType]}
        </span>
      </div>

      {gate.ruleType === "time-limited" && gate.windowStarts && (
        <p className="mt-2 text-[11px] font-medium text-muted-foreground">
          {formatWindow(gate.windowStarts)} &rarr;{" "}
          {formatWindow(gate.windowExpires)}
        </p>
      )}

      <div className="mt-3.5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-muted-foreground">Seats Filled</span>
          <span className="font-bold tabular-nums text-foreground">
            {gate.seatsFilled} / {gate.seatCapacity}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isFull ? "bg-destructive" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onRevoke(gate.id)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 py-2.5 text-sm font-semibold text-destructive transition-colors active:bg-destructive/20"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Revoke Access
      </button>
    </article>
  )
}
