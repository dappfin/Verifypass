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

export const CONNECTED_PROFILE = "takalaauli@gmail.com"

export const DISCOVERED_CONTENT: DiscoveredContent[] = [
  { id: "intro-blueprint", name: "Intro Blueprint" },
  { id: "premium-deep-dive", name: "Premium Deep-Dive" },
  { id: "vip-master-plan", name: "VIP Master Plan" },
  { id: "accelerator-cohort", name: "Accelerator Cohort" },
  { id: "founders-inner-circle", name: "Founders Inner Circle" },
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
    contentName: "Premium Deep-Dive",
    ruleType: "lifetime",
    seatCapacity: 50,
    seatsFilled: 12,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "gate-seed-2",
    nameNotice: "Q3 Launch - VIP Early Access",
    contentName: "VIP Master Plan",
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
    contentName: "Premium Deep-Dive",
    seatsRequested: 5,
    status: "pending",
    submittedAt: "2 hours ago",
  },
  {
    id: "claim-2",
    partnerEmail: "sara.lindqvist@nordicedu.se",
    contentName: "VIP Master Plan",
    seatsRequested: 3,
    status: "pending",
    submittedAt: "Yesterday",
  },
  {
    id: "claim-3",
    partnerEmail: "devteam@buildfast.co",
    contentName: "Intro Blueprint",
    seatsRequested: 10,
    status: "approved",
    submittedAt: "3 days ago",
  },
]
