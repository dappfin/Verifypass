"use client"

import { useState } from "react"
import { Toaster } from "sonner"
import { TopBar } from "@/components/top-bar"
import { WorkspaceSelector } from "@/components/workspace-selector"
import { TabNav, type TabKey } from "@/components/tab-nav"
import { ContentRulesPanel } from "@/components/content-rules-panel"
import { PartnerClaimsPanel } from "@/components/partner-claims-panel"
import {
  INITIAL_CLAIMS,
  INITIAL_GATES,
  type PartnerClaim,
  type ProtectedGate,
} from "@/lib/trustpass-data"

export default function Page() {
  const [tab, setTab] = useState<TabKey>("rules")
  const [gates, setGates] = useState<ProtectedGate[]>(INITIAL_GATES)
  const [claims, setClaims] = useState<PartnerClaim[]>(INITIAL_CLAIMS)

  const pendingClaims = claims.filter((c) => c.status === "pending").length

  const handleActivate = (gate: ProtectedGate) => {
    setGates((prev) => [gate, ...prev])
  }

  const handleRevoke = (id: string) => {
    setGates((prev) => prev.filter((g) => g.id !== id))
  }

  const handleDecision = (id: string, status: "approved" | "rejected") => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <WorkspaceSelector />
      <TabNav active={tab} onChange={setTab} claimCount={pendingClaims} />

      <main className="mx-auto max-w-lg px-4 pt-4">
        {tab === "rules" ? (
          <ContentRulesPanel
            gates={gates}
            onActivate={handleActivate}
            onRevoke={handleRevoke}
          />
        ) : (
          <PartnerClaimsPanel claims={claims} onDecision={handleDecision} />
        )}
      </main>

      <Toaster position="top-center" richColors />
    </div>
  )
}
