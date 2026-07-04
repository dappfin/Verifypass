"use client"

import { Activity, KeyRound, ShieldCheck, Wallet } from "lucide-react"
import type { ProtectedGate } from "@/lib/trustpass-data"

function MetricCard({
  icon: Icon,
  label,
  primary,
  secondary,
  progress,
}: {
  icon: typeof Wallet
  label: string
  primary: string
  secondary?: string
  progress?: number
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </span>
        <h3 className="text-sm font-semibold text-foreground text-balance">
          {label}
        </h3>
      </div>

      <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {primary}
      </p>
      {secondary ? (
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {secondary}
        </p>
      ) : null}

      {typeof progress === "number" ? (
        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
    </article>
  )
}

export function PartnerClaimsPanel({ gates }: { gates: ProtectedGate[] }) {
  const totalCapacity = gates.reduce((sum, g) => sum + g.seatCapacity, 0)
  const totalSold = gates.reduce((sum, g) => sum + g.seatsFilled, 0)
  const fillRate = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0

  return (
    <div className="space-y-6 pb-24">
      <section className="space-y-1 px-1">
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Activity className="h-5 w-5 text-primary" aria-hidden="true" />
          Live Automated Access Proof Ledger
        </h2>
        <p className="text-xs text-muted-foreground">
          Real-time metrics streamed from your active protected gates. No manual
          approvals required.
        </p>
      </section>

      <section className="space-y-3">
        <MetricCard
          icon={Wallet}
          label="Total Pack Sales Listened"
          primary={`${totalSold} / ${totalCapacity}`}
          secondary={`Seats sold across ${gates.length} active gate${
            gates.length === 1 ? "" : "s"
          } · ${Math.round(fillRate)}% of inventory`}
          progress={fillRate}
        />

        <MetricCard
          icon={KeyRound}
          label="Active ZK-Verified Accesses"
          primary={totalSold.toLocaleString("en-US")}
          secondary="Members who generated an automated local device proof and unlocked content"
        />
      </section>

      <section
        className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5"
        aria-live="polite"
      >
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
        </span>
        <p className="flex items-center gap-1.5 text-xs font-semibold leading-relaxed text-foreground">
          <ShieldCheck
            className="h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span className="text-pretty">
            Zero-Knowledge Access Control Active — No Sensitive Customer Data
            Stored on Backend Engine.
          </span>
        </p>
      </section>
    </div>
  )
}
