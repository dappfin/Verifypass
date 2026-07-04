"use client"

import { useMemo, useState, useTransition } from "react"
import { Layers, PackageOpen } from "lucide-react"
import { IdentityBar } from "@/components/identity-bar"
import { OwnerPanel } from "@/components/owner-panel"
import { ResellerPanel } from "@/components/reseller-panel"
import { getMyRules } from "@/app/actions/rules"
import type { TrustPassRule } from "@/lib/db/schema"

export interface Identity {
  memberId: string
  email: string
  activeCommunityId: string
}

interface DashboardProps {
  user: { name: string; email: string }
  initialRules: TrustPassRule[]
}

type Tab = "owner" | "reseller"

export function Dashboard({ user, initialRules }: DashboardProps) {
  const [rules, setRules] = useState<TrustPassRule[]>(initialRules)
  const [tab, setTab] = useState<Tab>("owner")
  const [, startTransition] = useTransition()
  const [identity, setIdentity] = useState<Identity>({
    memberId: "",
    email: user.email,
    activeCommunityId: initialRules[0]?.creatorCommunityId ?? "",
  })

  // Known community profiles derived from the owner's rules.
  const communities = useMemo(() => {
    const set = new Set<string>()
    for (const r of rules) {
      if (r.creatorCommunityId) set.add(r.creatorCommunityId)
      if (r.resellerCommunityId) set.add(r.resellerCommunityId)
    }
    if (identity.activeCommunityId) set.add(identity.activeCommunityId)
    return Array.from(set)
  }, [rules, identity.activeCommunityId])

  const refreshRules = () => {
    startTransition(async () => {
      const data = await getMyRules()
      setRules(data)
    })
  }

  const patchIdentity = (patch: Partial<Identity>) => setIdentity((prev) => ({ ...prev, ...patch }))

  return (
    <div className="min-h-svh bg-background">
      <IdentityBar identity={identity} onChange={patchIdentity} communities={communities} userName={user.name} />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground text-balance">Access Control</h1>
          <p className="text-sm text-muted-foreground text-pretty">
            Execute content access across your Skool ecosystem. TrustPass handles authorization only — arrange deals and
            payments natively in Skool or Stripe.
          </p>
        </div>

        {/* Section switcher */}
        <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
          <TabButton active={tab === "owner"} onClick={() => setTab("owner")} icon={<Layers className="size-4" aria-hidden="true" />}>
            My Content Rules
          </TabButton>
          <TabButton
            active={tab === "reseller"}
            onClick={() => setTab("reseller")}
            icon={<PackageOpen className="size-4" aria-hidden="true" />}
          >
            Partner Content & Claims
          </TabButton>
        </div>

        {tab === "owner" ? (
          <OwnerPanel identity={identity} rules={rules} onMutated={refreshRules} />
        ) : (
          <ResellerPanel identity={identity} />
        )}
      </main>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
