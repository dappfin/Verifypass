"use client"

import { BookOpen, Check, Clock, Mail, Users, X } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { PartnerClaim } from "@/lib/trustpass-data"

function StatusBadge({ status }: { status: PartnerClaim["status"] }) {
  const map = {
    pending: {
      label: "Pending",
      className: "bg-accent text-accent-foreground",
      icon: Clock,
    },
    approved: {
      label: "Approved",
      className: "bg-primary/15 text-primary",
      icon: Check,
    },
    rejected: {
      label: "Rejected",
      className: "bg-destructive/10 text-destructive",
      icon: X,
    },
  }[status]
  const Icon = map.icon
  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        map.className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {map.label}
    </span>
  )
}

export function PartnerClaimsPanel({
  claims,
  onDecision,
}: {
  claims: PartnerClaim[]
  onDecision: (id: string, status: "approved" | "rejected") => void
}) {
  const pending = claims.filter((c) => c.status === "pending")
  const resolved = claims.filter((c) => c.status !== "pending")

  const decide = (
    id: string,
    email: string,
    status: "approved" | "rejected",
  ) => {
    onDecision(id, status)
    toast[status === "approved" ? "success" : "error"](
      `Claim ${status} for ${email}.`,
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
            Incoming Claims
          </h2>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {pending.length} pending
          </span>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-10 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No pending claims.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              New partner seat requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((claim) => (
              <article
                key={claim.id}
                className="rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      <Mail
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="truncate">{claim.partnerEmail}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <BookOpen
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{claim.contentName}</span>
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-secondary px-2.5 py-1 text-xs font-bold text-foreground">
                    {claim.seatsRequested} seats
                  </span>
                </div>

                <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                  Submitted {claim.submittedAt}
                </p>

                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      decide(claim.id, claim.partnerEmail, "rejected")
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground transition-colors active:bg-secondary"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      decide(claim.id, claim.partnerEmail, "approved")
                    }
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.99]"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="px-1 text-base font-bold text-foreground">
            Claim History
          </h2>
          <div className="space-y-2.5">
            {resolved.map((claim) => (
              <article
                key={claim.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {claim.partnerEmail}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {claim.contentName} &middot; {claim.seatsRequested} seats
                  </p>
                </div>
                <StatusBadge status={claim.status} />
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
