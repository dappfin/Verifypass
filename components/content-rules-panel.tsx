"use client"

import { useState } from "react"
import { ChevronDown, Lock, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { SeatCounter } from "@/components/seat-counter"
import { RuleTypeSelector } from "@/components/rule-type-selector"
import { GateCard } from "@/components/gate-card"
import {
  DISCOVERED_CONTENT,
  type ProtectedGate,
  type RuleType,
} from "@/lib/trustpass-data"

export function ContentRulesPanel({
  gates,
  onActivate,
  onRevoke,
}: {
  gates: ProtectedGate[]
  onActivate: (gate: ProtectedGate) => void
  onRevoke: (id: string) => void
}) {
  const [nameNotice, setNameNotice] = useState("")
  const [contentId, setContentId] = useState(DISCOVERED_CONTENT[0].id)
  const [seats, setSeats] = useState(50)
  const [ruleType, setRuleType] = useState<RuleType>("lifetime")
  const [windowStarts, setWindowStarts] = useState("")
  const [windowExpires, setWindowExpires] = useState("")

  const handleActivate = () => {
    if (!nameNotice.trim()) {
      toast.error("Add an Internal Name Notice first.")
      return
    }
    if (ruleType === "time-limited" && (!windowStarts || !windowExpires)) {
      toast.error("Set both a start and expiry window.")
      return
    }

    const content = DISCOVERED_CONTENT.find((c) => c.id === contentId)
    onActivate({
      id: `gate-${Date.now()}`,
      nameNotice: nameNotice.trim(),
      contentName: content?.name ?? "Unknown Content",
      ruleType,
      seatCapacity: seats,
      seatsFilled: 0,
      windowStarts: ruleType === "time-limited" ? windowStarts : undefined,
      windowExpires: ruleType === "time-limited" ? windowExpires : undefined,
      createdAt: Date.now(),
    })
    toast.success("Automated listener activated.")
    setNameNotice("")
  }

  return (
    <div className="space-y-5 pb-24">
      <section className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
        {/* Internal Name Notice */}
        <div className="space-y-1.5">
          <label
            htmlFor="name-notice"
            className="text-sm font-semibold text-foreground"
          >
            Internal Name Notice
          </label>
          <input
            id="name-notice"
            type="text"
            value={nameNotice}
            onChange={(e) => setNameNotice(e.target.value)}
            placeholder="e.g., Jane Harbison - 50 Premium Promo Seats"
            className="w-full rounded-xl border border-input bg-background px-4 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Content Selection */}
        <div className="space-y-1.5">
          <label
            htmlFor="content-select"
            className="text-sm font-semibold text-foreground"
          >
            Select Discovered Content
          </label>
          <div className="relative">
            <select
              id="content-select"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-input bg-background px-4 py-3.5 pr-11 text-base font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {DISCOVERED_CONTENT.map((content) => (
                <option key={content.id} value={content.id}>
                  {content.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Seat Allocation */}
        <div className="space-y-2.5">
          <span className="text-sm font-semibold text-foreground">
            Seat Allocation
          </span>
          <SeatCounter value={seats} onChange={setSeats} />
        </div>

        {/* Rule Type */}
        <div className="space-y-2.5">
          <span className="text-sm font-semibold text-foreground">
            Rule Type
          </span>
          <RuleTypeSelector value={ruleType} onChange={setRuleType} />
        </div>

        {/* Time-limited window */}
        {ruleType === "time-limited" && (
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-secondary/60 p-4">
            <div className="space-y-1.5">
              <label
                htmlFor="window-starts"
                className="text-xs font-semibold text-foreground"
              >
                Window Starts
              </label>
              <input
                id="window-starts"
                type="datetime-local"
                value={windowStarts}
                onChange={(e) => setWindowStarts(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="window-expires"
                className="text-xs font-semibold text-foreground"
              >
                Window Expires
              </label>
              <input
                id="window-expires"
                type="datetime-local"
                value={windowExpires}
                onChange={(e) => setWindowExpires(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Primary Action */}
        <button
          type="button"
          onClick={handleActivate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-sm transition-transform active:scale-[0.99]"
        >
          <Lock className="h-5 w-5" aria-hidden="true" />
          ACTIVATE AUTOMATED LISTENER
        </button>
      </section>

      {/* Active Ledger */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            Active Protected Gates
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {gates.length}
          </span>
        </div>

        {gates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No protected gates yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              Activate a listener above to create your first gate.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {gates.map((gate) => (
              <GateCard key={gate.id} gate={gate} onRevoke={onRevoke} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
