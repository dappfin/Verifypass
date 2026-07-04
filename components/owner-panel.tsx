"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Layers, Ticket, Infinity as InfinityIcon, Clock, Trash2, Plus, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HelpTip } from "@/components/help-tip"
import { createRule, revokeRule } from "@/app/actions/rules"
import type { TrustPassRule } from "@/lib/db/schema"
import type { Identity } from "@/components/dashboard"

const CONTENT_TYPES = [
  { value: "course", label: "Course" },
  { value: "workshop", label: "Workshop" },
  { value: "summit", label: "Summit" },
  { value: "bundle", label: "Bundle" },
]

const CAP_MAX = 100
const CAP_PRESETS = [10, 25, 100] as const

type AccessRule = "lifetime" | "one_time" | "time_limited"

interface OwnerPanelProps {
  identity: Identity
  rules: TrustPassRule[]
  onMutated: () => void
}

export function OwnerPanel({ identity, rules, onMutated }: OwnerPanelProps) {
  const [nameNotice, setNameNotice] = useState("")
  const [contentType, setContentType] = useState("course")
  const [contentId, setContentId] = useState("")
  const [resellerCommunityId, setResellerCommunityId] = useState("")
  const [accessRule, setAccessRule] = useState<AccessRule>("lifetime")
  const [capped, setCapped] = useState(false)
  const [inventoryCap, setInventoryCap] = useState(10)
  const [windowStartsAt, setWindowStartsAt] = useState("")
  const [windowExpiresAt, setWindowExpiresAt] = useState("")
  const [isPending, startTransition] = useTransition()

  const clampCap = (n: number) => Math.max(1, Math.min(CAP_MAX, Math.trunc(n) || 1))

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await createRule({
        nameNotice,
        creatorMemberId: identity.memberId,
        creatorEmail: identity.email,
        creatorCommunityId: identity.activeCommunityId,
        resellerCommunityId,
        contentType,
        contentId,
        accessRule,
        inventoryCap: capped ? inventoryCap : 0,
        windowStartsAt: accessRule === "time_limited" ? windowStartsAt : null,
        windowExpiresAt: accessRule === "time_limited" ? windowExpiresAt : null,
      })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Access rule published to the ledger.")
      setNameNotice("")
      setContentId("")
      setResellerCommunityId("")
      onMutated()
    })
  }

  const handleRevoke = (id: string) => {
    startTransition(async () => {
      const res = await revokeRule(id)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success("Access revoked.")
      onMutated()
    })
  }

  const toggle = (rule: AccessRule) => setAccessRule(rule)

  const activeRules = rules.filter((r) => r.isActive)

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-border/60 bg-card shadow-lg shadow-black/5">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <Layers className="size-6 text-primary" aria-hidden="true" />
            <CardTitle className="text-2xl">My Content Rules</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            Authorize another community to host content you own. Deals and payments happen outside TrustPass.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-7">
          {/* Internal Name Notice */}
          <div className="flex flex-col gap-2 rounded-xl bg-muted/40 p-4 shadow-sm">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="nameNotice" className="text-base">
                Internal Name Notice
              </Label>
              <HelpTip
                title="Internal Name Notice"
                hint="A private label for your own reference."
                body={[
                  "Give this rule a friendly, internal-only name so you can recognize the deal at a glance.",
                  "It is never shown to buyers — it is purely for organizing your ledger, e.g. \"Q1 Partner Deal – Beta Co.\".",
                ]}
              />
            </div>
            <Input
              id="nameNotice"
              value={nameNotice}
              onChange={(e) => setNameNotice(e.target.value)}
              placeholder="e.g., Partner Deal Name"
              className="h-12 text-base"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="contentType" className="text-base">Content Type</Label>
                <HelpTip
                  title="Content Type"
                  hint="What kind of Skool entity you are gating."
                  body={[
                    "Pick the format of the content being sold: a Course, a live Workshop, a multi-session Summit, or a Bundle of items.",
                    "This is metadata used for reporting and display; access enforcement is identical across types.",
                  ]}
                />
              </div>
              <Select value={contentType} onValueChange={(v) => setContentType(v ?? "course")}>
                <SelectTrigger id="contentType" className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="contentId" className="text-base">Content Target ID</Label>
                <HelpTip
                  title="Content Target ID"
                  hint="The Skool classroom / entity ID to unlock."
                  body={[
                    "This is the local Skool classroom or entity ID inside your source community that holds the actual content.",
                    "Open the classroom in Skool and copy the ID from the URL. The verify endpoint matches on this exact value.",
                  ]}
                />
              </div>
              <Input
                id="contentId"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="classroom_..."
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="reseller" className="text-base">Reseller Community ID</Label>
              <HelpTip
                title="Reseller Community ID"
                hint="The community you authorize to host / sell this content."
                body={[
                  "Enter the Skool Community ID of your partner — the community allowed to embed and sell access to this content.",
                  "Only requests coming from this community ID will be authorized by the verify endpoint.",
                ]}
              />
            </div>
            <Input
              id="reseller"
              value={resellerCommunityId}
              onChange={(e) => setResellerCommunityId(e.target.value)}
              placeholder="cmty_partner_..."
              className="h-12 text-base"
            />
          </div>

          <Separator />

          {/* Access rule toggles */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-semibold text-foreground">Access Rule</span>
              <HelpTip
                title="Access Rule"
                hint="How long an authorized buyer keeps access."
                body={[
                  "Lifetime: access never expires once granted.",
                  "One-Time: a single successful unlock is allowed per buyer.",
                  "Time-Limited: access is only valid inside the start/end window you define.",
                ]}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <RuleToggle
                active={accessRule === "lifetime"}
                onClick={() => toggle("lifetime")}
                icon={<InfinityIcon className="size-5" aria-hidden="true" />}
                label="Lifetime"
              />
              <RuleToggle
                active={accessRule === "one_time"}
                onClick={() => toggle("one_time")}
                icon={<Ticket className="size-5" aria-hidden="true" />}
                label="One-Time"
              />
              <RuleToggle
                active={accessRule === "time_limited"}
                onClick={() => toggle("time_limited")}
                icon={<Clock className="size-5" aria-hidden="true" />}
                label="Time-Limited"
              />
            </div>

            {accessRule === "time_limited" && (
              <div className="grid gap-5 rounded-xl border border-border bg-muted/30 p-4 shadow-sm sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="startsAt" className="text-sm">
                      Window Starts
                    </Label>
                    <HelpTip
                      title="Window Start"
                      hint="When access becomes valid."
                      body={["Access requests before this timestamp are denied by the verify endpoint's system-clock check."]}
                    />
                  </div>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={windowStartsAt}
                    onChange={(e) => setWindowStartsAt(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="expiresAt" className="text-sm">
                      Window Expires
                    </Label>
                    <HelpTip
                      title="Window Expiry"
                      hint="When access stops being valid."
                      body={["After this timestamp the verify endpoint returns Access Denied for this rule."]}
                    />
                  </div>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={windowExpiresAt}
                    onChange={(e) => setWindowExpiresAt(e.target.value)}
                    className="h-12 text-base"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Token-capped counter */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="capToggle" className="text-base">Token-Capped Inventory</Label>
                <HelpTip
                  title="Token-Capped Inventory"
                  hint="Limit total seats to a strict slot count."
                  body={[
                    "Off: unlimited unlocks (inventory cap = 0).",
                    "On: only the number of slots you set can ever be claimed. Each successful unlock increments the counter atomically, so you can never oversell.",
                    "Great for cohort-based launches or limited seat drops.",
                  ]}
                />
              </div>
              <Switch id="capToggle" checked={capped} onCheckedChange={setCapped} />
            </div>

            {capped && (
              <div className="flex flex-col gap-4 rounded-xl border border-border bg-muted/30 p-5 shadow-sm">
                {/* Interactive seat counter */}
                <div className="flex items-center justify-center gap-5">
                  <button
                    type="button"
                    aria-label="Decrease seats"
                    onClick={() => setInventoryCap((c) => clampCap(c - 1))}
                    disabled={inventoryCap <= 1}
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Minus className="size-6" aria-hidden="true" />
                  </button>

                  <div className="flex min-w-24 flex-col items-center">
                    <span
                      className="tabular-nums text-5xl font-bold leading-none text-foreground"
                      aria-live="polite"
                    >
                      {inventoryCap}
                    </span>
                    <span className="mt-1 text-sm font-medium text-muted-foreground">seats</span>
                  </div>

                  <button
                    type="button"
                    aria-label="Increase seats"
                    onClick={() => setInventoryCap((c) => clampCap(c + 1))}
                    disabled={inventoryCap >= CAP_MAX}
                    className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-foreground shadow-sm transition-colors hover:border-primary/50 hover:bg-accent active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="size-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Quick presets */}
                <div className="grid grid-cols-4 gap-2.5">
                  {CAP_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInventoryCap(preset)}
                      aria-pressed={inventoryCap === preset}
                      className={`h-12 rounded-xl border text-base font-semibold tabular-nums transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        inventoryCap === preset
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setInventoryCap(CAP_MAX)}
                    aria-pressed={inventoryCap === CAP_MAX}
                    className={`h-12 rounded-xl border text-base font-semibold transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      inventoryCap === CAP_MAX
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent"
                    }`}
                  >
                    Max
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isPending}
            size="lg"
            className="h-14 gap-2 text-base font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="size-5" aria-hidden="true" />
            {isPending ? "Publishing..." : "Publish Access Rule"}
          </Button>
        </CardContent>
      </Card>

      {/* Active rules list */}
      <Card className="border-border/60 bg-card shadow-lg shadow-black/5">
        <CardHeader>
          <CardTitle className="text-xl">Active Rules</CardTitle>
          <CardDescription className="text-base">
            {activeRules.length} active {activeRules.length === 1 ? "rule" : "rules"} in your ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activeRules.length === 0 && (
            <p className="rounded-xl border border-dashed border-border py-10 text-center text-base text-muted-foreground">
              No active rules yet. Publish one above to authorize a partner.
            </p>
          )}
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                {rule.nameNotice && (
                  <span className="text-base font-semibold text-foreground">{rule.nameNotice}</span>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {rule.contentType}
                  </Badge>
                  <span className="font-mono text-sm text-foreground">{rule.contentId}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{rule.accessRule.replace("_", " ")}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {rule.inventoryCap > 0
                      ? `${rule.tokensClaimed}/${rule.inventoryCap} claimed`
                      : "Unlimited"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>→ {rule.resellerCommunityId}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleRevoke(rule.id)}
                disabled={isPending}
                className="h-12 gap-2 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="size-5" aria-hidden="true" />
                Revoke Access
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function RuleToggle({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-base font-medium shadow-sm transition-colors active:scale-95 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
