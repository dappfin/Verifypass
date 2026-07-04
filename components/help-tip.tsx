"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface HelpTipProps {
  title: string
  /** Short one-liner shown on hover. */
  hint: string
  /** Longer explanation shown in the modal. Accepts plain strings per line. */
  body: string[]
  label?: string
}

/**
 * Compact "?" help icon. Hover shows a native tooltip; click opens an inline
 * modal explaining how to configure the specific logic rule.
 */
export function HelpTip({ title, hint, body, label }: HelpTipProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        type="button"
        title={hint}
        aria-label={label ?? `Help: ${title}`}
        className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-4" aria-hidden="true" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{hint}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground leading-relaxed">
          {body.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
