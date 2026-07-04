"use client"

import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"
import { Layers, Ticket, Infinity as InfinityIcon, Clock, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
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

type AccessRule = "lifetime" | "one_time" | "time_limited"

interface OwnerPanelProps {
  identity: Identity
  rules: TrustPassRule[]
  onMutated: () => void
}

export function OwnerPanel({ identity, rules, onMutated }: OwnerPanelProps) {
  const [contentType, setContentType] = useState("course")
  const [contentId, setContentId] = useState("")
  const [resellerCommunityId, setResellerCommunityId] = useState("")
  const [accessRule, setAccessRule] = useState<AccessRule>("lifetime")
  const [capped, setCapped] = useState(false)
  const [inventoryCap, setInventoryCap] = useState(10)
  const [windowStartsAt, setWindowStartsAt] = useState("")
  const [windowExpiresAt, setWindowExpiresAt] = useState("")
  const [isPending, startTransition] = useTransition()

  // Live payload constructed in real time as the user toggles fields.
  const payload = useMemo(
    () => ({
      creatorMemberId: identity.memberId || null,
      creatorEmail: identity.email,
      creatorCommunityId: identity.activeCommunityId || null,
      resellerCommunityId: resellerCommunityId || null,
      contentType,
      contentId: contentId || null,
      accessRule,
      inventoryCap: capped ? inventoryCap : 0,
      windowStartsAt: accessRule === "time_limited" ? windowStartsAt || null : null,
      windowExpiresAt: accessRule === "time_limited" ? windowExpiresAt || null : null,
    }),
    [identity, resellerCommunityId, contentType, contentId, accessRule, capped, inventoryCap, windowStartsAt, windowExpiresAt],
  )

  const handleSubmit = () => {
    startTransition(async () => {
      const res = await createRule({
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
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>My Content Rules</CardTitle>
          </div>
          <CardDescription>
            Authorize another community to host content you own. Deals and payments happen outside TrustPass.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor="contentType">Content Type</Label>
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
                <SelectTrigger id="contentType">
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

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <Label htmlFor="contentId">Content Target ID</Label>
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
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <Label htmlFor="reseller">Reseller Community ID</Label>
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
            />
          </div>

          <Separator />

          {/* Access rule toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Access Rule</span>
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
            <div className="grid gap-2 sm:grid-cols-3">
              <RuleToggle
                active={accessRule === "lifetime"}
                onClick={() => toggle("lifetime")}
                icon={<InfinityIcon className="size-4" aria-hidden="true" />}
                label="Lifetime"
              />
              <RuleToggle
                active={accessRule === "one_time"}
                onClick={() => toggle("one_time")}
                icon={<Ticket className="size-4" aria-hidden="true" />}
                label="One-Time"
              />
              <RuleToggle
                active={accessRule === "time_limited"}
                onClick={() => toggle("time_limited")}
                icon={<Clock className="size-4" aria-hidden="true" />}
                label="Time-Limited"
              />
            </div>

            {accessRule === "time_limited" && (
              <div className="grid gap-4 rounded-lg border border-border bg-muted/40 p-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="startsAt" className="text-xs">
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
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1">
                    <Label htmlFor="expiresAt" className="text-xs">
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
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Token-capped counter */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="capToggle">Token-Capped Inventory</Label>
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
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Slots</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {inventoryCap} seats
                  </Badge>
                </div>
                <Slider
                  value={[inventoryCap]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(v) => setInventoryCap(Array.isArray(v) ? v[0] : v)}
                  aria-label="Inventory slot count"
                />
              </div>
            )}
          </div>

          {/* Live JSON preview */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-muted-foreground">Live payload preview</span>
              <HelpTip
                title="Live Payload"
                hint="The exact JSON that will be written to the ledger."
                body={[
                  "This updates in real time as you toggle fields.",
                  "It mirrors the body sent to POST /api/rules/create so you can audit exactly what gets stored.",
                ]}
              />
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs leading-relaxed text-foreground">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>

          <Button onClick={handleSubmit} disabled={isPending} className="gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            {isPending ? "Publishing..." : "Publish Access Rule"}
          </Button>
        </CardContent>
      </Card>

      {/* Active rules list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Rules</CardTitle>
          <CardDescription>
            {activeRules.length} active {activeRules.length === 1 ? "rule" : "rules"} in your ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activeRules.length === 0 && (
            <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No active rules yet. Publish one above to authorize a partner.
            </p>
          )}
          {activeRules.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {rule.contentType}
                  </Badge>
                  <span className="font-mono text-sm text-foreground">{rule.contentId}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
                size="sm"
                onClick={() => handleRevoke(rule.id)}
                disabled={isPending}
                className="gap-1.5 text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="size-4" aria-hidden="true" />
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
      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
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
