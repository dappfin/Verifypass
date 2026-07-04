"use client"

import type React from "react"
import { useState } from "react"
import { ShieldCheck, ShieldAlert, Loader2, Unlock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

interface EmbedPlayerProps {
  contentId: string
  communityId: string
  buyerEmail: string
}

type Status = "idle" | "checking" | "authorized" | "denied"

export function EmbedPlayer({ contentId, communityId, buyerEmail: initialEmail }: EmbedPlayerProps) {
  const [buyerEmail, setBuyerEmail] = useState(initialEmail)
  const [status, setStatus] = useState<Status>("idle")
  const [reason, setReason] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("checking")
    setReason(null)
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyerEmail, requestingCommunityId: communityId, contentId }),
      })
      const data = await res.json()
      if (res.ok && data.authorized) {
        setToken(data.token)
        setStatus("authorized")
      } else {
        setReason(data.reason ?? "Access Denied")
        setStatus("denied")
      }
    } catch {
      setReason("Network error")
      setStatus("denied")
    }
  }

  return (
    <main className="min-h-svh bg-background flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">TrustPass Secure Content</p>
            <p className="text-xs text-muted-foreground font-mono">{contentId || "no-content-id"}</p>
          </div>
        </div>

        {status === "authorized" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-success">
              <Unlock className="size-5" aria-hidden="true" />
              <p className="text-sm font-medium">Access authorized. Content unlocked.</p>
            </div>
            <div className="aspect-video w-full rounded-lg border border-border bg-muted/60 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center px-4">
                Your gated Skool lesson renders here once the token is validated.
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Signed access token (JWT)</span>
              <code className="block max-h-24 overflow-auto rounded-md border border-border bg-muted/60 p-2 font-mono text-[11px] leading-relaxed break-all text-foreground">
                {token}
              </code>
            </div>
          </div>
        ) : status === "denied" ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
              <ShieldAlert className="size-5" aria-hidden="true" />
              <p className="text-sm font-medium">{reason}</p>
            </div>
            <Button variant="outline" onClick={() => setStatus("idle")}>
              Try again
            </Button>
          </div>
        ) : (
          <form onSubmit={verify} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground text-pretty">
              Confirm your purchase email to unlock this content for community{" "}
              <span className="font-mono text-foreground">{communityId || "—"}</span>.
            </p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="buyerEmail">Purchase email</Label>
              <Input
                id="buyerEmail"
                type="email"
                required
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" disabled={status === "checking"} className="gap-1.5">
              {status === "checking" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Verifying...
                </>
              ) : (
                <>
                  <Unlock className="size-4" aria-hidden="true" />
                  Unlock Content
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}
