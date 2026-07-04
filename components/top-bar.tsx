import { ShieldCheck } from "lucide-react"
import { CONNECTED_PROFILE } from "@/lib/trustpass-data"

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-foreground">
              TrustPass
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Zero-Knowledge Access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full bg-primary"
            aria-hidden="true"
          />
          <div className="leading-tight text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Skool Profile
            </p>
            <p className="max-w-[9.5rem] truncate text-xs font-semibold text-foreground">
              {CONNECTED_PROFILE}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
