"use client"

import { useState } from "react"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CONNECTED_WORKSPACES,
  type CommunityWorkspace,
} from "@/lib/trustpass-data"

type WorkspaceSelectorProps = {
  // Dynamic array of communities fetched from backend profile data.
  // Falls back to the generic mock workspaces for public-release UI states.
  workspaces?: CommunityWorkspace[]
}

export function WorkspaceSelector({
  workspaces = CONNECTED_WORKSPACES,
}: WorkspaceSelectorProps) {
  const defaultId =
    workspaces.find((w) => w.isDefault)?.id ?? workspaces[0]?.id ?? ""
  const [activeId, setActiveId] = useState(defaultId)

  if (workspaces.length === 0) return null

  return (
    <section
      aria-label="Select Active Workspace"
      className="border-b border-border bg-card"
    >
      <div className="mx-auto max-w-lg px-4 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-foreground">
            <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
            Select Active Workspace
          </p>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            System Sync Online
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Connected communities"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {workspaces.map((workspace) => {
            const isActive = workspace.id === activeId
            return (
              <button
                key={workspace.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActiveId(workspace.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  "min-h-[40px] whitespace-nowrap",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground active:bg-accent",
                )}
              >
                {workspace.name}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
