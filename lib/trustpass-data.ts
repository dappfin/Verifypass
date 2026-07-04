export type RuleType = "lifetime" | "one-time" | "time-limited"

export type DiscoveredContent = {
  id: string
  name: string
}

export type ProtectedGate = {
  id: string
  nameNotice: string
  contentName: string
  ruleType: RuleType
  seatCapacity: number
  seatsFilled: number
  windowStarts?: string
  windowExpires?: string
  createdAt: number
}

export type PartnerClaim = {
  id: string
  partnerEmail: string
  contentName: string
  seatsRequested: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

// The connected Skool profile is provided via environment configuration so
// no personal email address is committed to source control. It must be
// prefixed with NEXT_PUBLIC_ because it is rendered in the client UI.
export const CONNECTED_PROFILE =
  process.env.NEXT_PUBLIC_SKOOL_PROFILE_EMAIL ?? "Not connected"

export const DISCOVERED_CONTENT: DiscoveredContent[] = [
  { id: "course-access", name: "Course Access" },
  { id: "workshop-access", name: "Workshop Access" },
  { id: "summit-pass", name: "Summit Pass" },
  { id: "tool-software-access", name: "Tool / Software Access" },
  { id: "webinar-live-call-access", name: "Webinar / Live Call Access" },
]

export const RULE_TYPE_LABELS: Record<RuleType, string> = {
  lifetime: "Lifetime",
  "one-time": "One-Time",
  "time-limited": "Time-Limited",
}

export const SEAT_PRESETS = [10, 25, 100] as const
export const MAX_SEATS = 500

export const INITIAL_GATES: ProtectedGate[] = [
  {
    id: "gate-seed-1",
    nameNotice: "Jane Harbison - 50 Premium Promo Seats",
    contentName: "Course Access",
    ruleType: "lifetime",
    seatCapacity: 50,
    seatsFilled: 12,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "gate-seed-2",
    nameNotice: "Q3 Launch - VIP Early Access",
    contentName: "Summit Pass",
    ruleType: "time-limited",
    seatCapacity: 25,
    seatsFilled: 25,
    windowStarts: "2026-07-01T09:00",
    windowExpires: "2026-07-31T23:59",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
]

export const INITIAL_CLAIMS: PartnerClaim[] = [
  {
    id: "claim-1",
    partnerEmail: "marcus@growthlabs.io",
    contentName: "Course Access",
    seatsRequested: 5,
    status: "pending",
    submittedAt: "2 hours ago",
  },
  {
    id: "claim-2",
    partnerEmail: "sara.lindqvist@nordicedu.se",
    contentName: "Summit Pass",
    seatsRequested: 3,
    status: "pending",
    submittedAt: "Yesterday",
  },
  {
    id: "claim-3",
    partnerEmail: "devteam@buildfast.co",
    contentName: "Workshop Access",
    seatsRequested: 10,
    status: "approved",
    submittedAt: "3 days ago",
  },
]
