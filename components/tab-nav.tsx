"use client"

import { cn } from "@/lib/utils"

export type TabKey = "rules" | "claims"

const TABS: { key: TabKey; label: string }[] = [
  { key: "rules", label: "My Content Rules" },
  { key: "claims", label: "Partner Claims" },
]

export function TabNav({
  active,
  onChange,
  claimCount,
}: {
  active: TabKey
  onChange: (key: TabKey) => void
  claimCount: number
}) {
  return (
    <nav className="mx-auto max-w-lg px-4 pt-3">
      <div
        role="tablist"
        aria-label="TrustPass sections"
        className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-secondary p-1"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.key === "claims" && claimCount > 0 && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground/20 text-foreground",
                  )}
                >
                  {claimCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
