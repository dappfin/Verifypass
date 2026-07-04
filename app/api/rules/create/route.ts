import { randomUUID } from "crypto"
import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trustPassRule } from "@/lib/db/schema"

/**
 * POST /api/rules/create
 * Ingests and saves a new access permission configuration to the ledger.
 * Verifies the active session owner matches the rule creator parameters.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 })
  }

  const {
    nameNotice,
    creatorMemberId,
    creatorEmail,
    creatorCommunityId,
    resellerCommunityId,
    contentType,
    contentId,
    accessRule,
    inventoryCap,
    windowStartsAt,
    windowExpiresAt,
  } = body as Record<string, string | number | null | undefined>

  const requiredStrings = {
    creatorMemberId,
    creatorEmail,
    creatorCommunityId,
    resellerCommunityId,
    contentType,
    contentId,
    accessRule,
  }
  for (const [key, value] of Object.entries(requiredStrings)) {
    if (!value || !String(value).trim()) {
      return NextResponse.json({ ok: false, error: `Missing field: ${key}` }, { status: 400 })
    }
  }

  // Ownership verification: the verified session email must match the rule's
  // declared creator email so a user cannot register content as someone else.
  if (String(creatorEmail).trim().toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: "Creator email must match the authenticated master account." },
      { status: 403 },
    )
  }

  if (!["course", "workshop", "summit", "bundle"].includes(String(contentType))) {
    return NextResponse.json({ ok: false, error: "Invalid contentType" }, { status: 400 })
  }
  if (!["one_time", "lifetime", "time_limited"].includes(String(accessRule))) {
    return NextResponse.json({ ok: false, error: "Invalid accessRule" }, { status: 400 })
  }

  let startsAt: Date | null = null
  let expiresAt: Date | null = null
  if (accessRule === "time_limited") {
    if (!windowStartsAt || !windowExpiresAt) {
      return NextResponse.json(
        { ok: false, error: "time_limited requires windowStartsAt and windowExpiresAt" },
        { status: 400 },
      )
    }
    startsAt = new Date(String(windowStartsAt))
    expiresAt = new Date(String(windowExpiresAt))
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime()) || expiresAt <= startsAt) {
      return NextResponse.json({ ok: false, error: "Invalid time window" }, { status: 400 })
    }
  }

  const cap = Math.max(0, Math.min(100, Math.trunc(Number(inventoryCap ?? 0)) || 0))

  const [row] = await db
    .insert(trustPassRule)
    .values({
      id: randomUUID(),
      userId: session.user.id,
      nameNotice: nameNotice ? String(nameNotice).trim() || null : null,
      creatorMemberId: String(creatorMemberId).trim(),
      creatorEmail: String(creatorEmail).trim().toLowerCase(),
      creatorCommunityId: String(creatorCommunityId).trim(),
      resellerCommunityId: String(resellerCommunityId).trim(),
      contentType: String(contentType),
      contentId: String(contentId).trim(),
      accessRule: String(accessRule),
      inventoryCap: cap,
      windowStartsAt: startsAt,
      windowExpiresAt: expiresAt,
      isActive: true,
    })
    .returning()

  return NextResponse.json({ ok: true, rule: row }, { status: 201 })
}
