"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { PackageOpen, Link2, Check, Timer, Users, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HelpTip } from "@/components/help-tip"
import { getPartnerRules } from "@/app/actions/rules"
import type { TrustPassRule } from "@/lib/db/schema"
import type { Identity } from "@/components/dashboard"

interface ResellerPanelProps {
  identity: Identity
}

export function ResellerPanel({ identity }: ResellerPanelProps) {
  const [rules, setRules] = useState<TrustPassRule[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const load = () => {
    if (!identity.activeCommunityId.trim()) {
      setRules([])
      return
    }
    startTransition(async () => {
      const data = await getPartnerRules(identity.activeCommunityId)
      setRules(data)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity.activeCommunityId])

  const generateLink = async (rule: TrustPassRule) => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({
      contentId: rule.contentId,
      communityId: rule.resellerCommunityId,
      buyerEmail: identity.email,
    })
    const url = `${origin}/embed?${params.toString()}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(rule.id)
      toast.success("Embed link copied to clipboard.")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error("Could not access clipboard. Copy manually: " + url)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageOpen className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Partner Content & Claims</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={load}
            disabled={isPending}
            className="gap-1.5"
            aria-label="Refresh partner content"
          >
            <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
          </Button>
        </div>
        <CardDescription>
          Token packages authorized to your active community{" "}
          <span className="font-mono text-foreground">{identity.activeCommunityId || "—"}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!identity.activeCommunityId.trim() && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Set an Active Community ID in the top bar to load acquired packages.
          </p>
        )}

        {identity.activeCommunityId.trim() && rules.length === 0 && !isPending && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            No content has been authorized to this community yet.
          </p>
        )}

        {rules.map((rule) => (
          <PartnerCard
            key={rule.id}
            rule={rule}
            copied={copiedId === rule.id}
            onGenerate={() => generateLink(rule)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function PartnerCard({
  rule,
  copied,
  onGenerate,
}: {
  rule: TrustPassRule
  copied: boolean
  onGenerate: () => void
}) {
  const seatsLeft = rule.inventoryCap > 0 ? rule.inventoryCap - rule.tokensClaimed : null
  const soldOut = seatsLeft !== null && seatsLeft <= 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {rule.contentType}
            </Badge>
            <span className="font-mono text-sm text-foreground">{rule.contentId}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            From creator community <span className="font-mono">{rule.creatorCommunityId}</span>
          </p>
        </div>
        <Badge
          variant="secondary"
          className="capitalize"
        >
          {rule.accessRule.replace("_", " ")}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {rule.inventoryCap > 0 ? (
          <Metric
            icon={<Users className="size-4" aria-hidden="true" />}
            label="Seats"
            value={`${Math.max(0, seatsLeft as number)}/${rule.inventoryCap}`}
            tone={soldOut ? "danger" : "default"}
          />
        ) : (
          <Metric icon={<Users className="size-4" aria-hidden="true" />} label="Seats" value="Unlimited" />
        )}

        {rule.accessRule === "time_limited" && rule.windowExpiresAt && (
          <Countdown expiresAt={new Date(rule.windowExpiresAt)} />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={onGenerate} disabled={soldOut} size="sm" className="gap-1.5">
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Link2 className="size-4" aria-hidden="true" />
              Generate Embedded iFrame Link
            </>
          )}
        </Button>
        <HelpTip
          title="Embedded iFrame Link"
          hint="Paste this secure URL into a Skool classroom window."
          body={[
            "Clicking this copies a secure URL carrying the content ID and your community ID as parameters.",
            "In Skool, open the classroom lesson, add an embed / iframe block, and paste this URL as the source.",
            "When a buyer loads the lesson, the embed calls TrustPass /api/verify to check their access and unlock the content.",
          ]}
        />
        {soldOut && <span className="text-xs font-medium text-destructive">Sold out</span>}
      </div>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: "default" | "danger"
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <div className="leading-tight">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-semibold tabular-nums ${tone === "danger" ? "text-destructive" : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Countdown({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState(() => expiresAt.getTime() - Date.now())

  useEffect(() => {
    const t = setInterval(() => setRemaining(expiresAt.getTime() - Date.now()), 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  const expired = remaining <= 0
  const label = expired ? "Expired" : formatDuration(remaining)

  return (
    <div className="flex items-center gap-2">
      <span className={expired ? "text-destructive" : "text-muted-foreground"}>
        <Timer className="size-4" aria-hidden="true" />
      </span>
      <div className="leading-tight">
        <p className="text-xs text-muted-foreground">Expires in</p>
        <p className={`text-sm font-semibold tabular-nums ${expired ? "text-destructive" : "text-foreground"}`}>
          {label}
        </p>
      </div>
    </div>
  )
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
}
