"use client"

import { ShieldCheck, ChevronDown, LogOut, Building2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HelpTip } from "@/components/help-tip"
import type { Identity } from "@/components/dashboard"

interface IdentityBarProps {
  identity: Identity
  onChange: (patch: Partial<Identity>) => void
  communities: string[]
  userName: string
}

export function IdentityBar({ identity, onChange, communities, userName }: IdentityBarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-foreground">TrustPass</p>
            <p className="text-xs text-muted-foreground">Access execution ledger</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="memberId" className="text-xs">
                Skool Member ID
              </Label>
              <HelpTip
                title="Master Skool Member ID"
                hint="Your root owner identity across all communities."
                body={[
                  "This is the single master identity that owns every community profile you manage.",
                  "Find it in your Skool profile URL or account settings. It binds all rules you create back to you.",
                ]}
              />
            </div>
            <Input
              id="memberId"
              value={identity.memberId}
              onChange={(e) => onChange({ memberId: e.target.value })}
              placeholder="mbr_..."
              className="h-9 w-40"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <Label htmlFor="activeCommunity" className="text-xs">
                Active Community ID
              </Label>
              <HelpTip
                title="Active Community Context"
                hint="Switch which child community profile you are acting as."
                body={[
                  "Each Skool community you own is an isolated child profile.",
                  "Switch here to scope the Owner and Partner panels to a specific community context.",
                  "Type a new ID to add another community profile to the switcher.",
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              {communities.length > 0 && (
                <Select
                  value={communities.includes(identity.activeCommunityId) ? identity.activeCommunityId : null}
                  onValueChange={(v) => onChange({ activeCommunityId: v ?? "" })}
                >
                  <SelectTrigger className="h-9 w-9 px-0 justify-center" aria-label="Pick saved community">
                    <ChevronDown className="size-4" aria-hidden="true" />
                    <SelectValue className="sr-only" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((c) => (
                      <SelectItem key={c} value={c}>
                        <span className="flex items-center gap-2">
                          <Building2 className="size-3.5" aria-hidden="true" />
                          {c}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                id="activeCommunity"
                value={identity.activeCommunityId}
                onChange={(e) => onChange({ activeCommunityId: e.target.value })}
                placeholder="cmty_..."
                className="h-9 w-40"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pl-1">
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">{identity.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="h-9 gap-1.5 bg-transparent">
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
