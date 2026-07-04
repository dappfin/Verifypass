import { type NextRequest, NextResponse } from "next/server"
import { and, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { trustPassRule } from "@/lib/db/schema"
import { signAccessToken } from "@/lib/jwt"

const DENIED = { authorized: false as const, reason: "Access Denied" }

/**
 * POST /api/verify
 * Execution endpoint hit by the embedded iFrame player window.
 * Body: { buyerEmail, requestingCommunityId, contentId }
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(DENIED, { status: 403 })
  }

  const buyerEmail = String(body.buyerEmail ?? "").trim().toLowerCase()
  const requestingCommunityId = String(body.requestingCommunityId ?? "").trim()
  const contentId = String(body.contentId ?? "").trim()

  if (!buyerEmail || !requestingCommunityId || !contentId) {
    return NextResponse.json(DENIED, { status: 403 })
  }

  // Look up an active rule authorizing this community to host this content.
  const [rule] = await db
    .select()
    .from(trustPassRule)
    .where(
      and(
        eq(trustPassRule.contentId, contentId),
        eq(trustPassRule.resellerCommunityId, requestingCommunityId),
        eq(trustPassRule.isActive, true),
      ),
    )
    .limit(1)

  if (!rule) {
    return NextResponse.json(DENIED, { status: 403 })
  }

  // Time-limited window check against the system clock.
  if (rule.accessRule === "time_limited") {
    const now = Date.now()
    const startOk = !rule.windowStartsAt || now >= rule.windowStartsAt.getTime()
    const endOk = !rule.windowExpiresAt || now <= rule.windowExpiresAt.getTime()
    if (!startOk || !endOk) {
      return NextResponse.json(DENIED, { status: 403 })
    }
  }

  // Inventory cap: atomically increment only if a slot is available. The
  // conditional UPDATE prevents overselling under concurrent requests.
  if (rule.inventoryCap > 0) {
    const [claimed] = await db
      .update(trustPassRule)
      .set({ tokensClaimed: sql`${trustPassRule.tokensClaimed} + 1` })
      .where(
        and(
          eq(trustPassRule.id, rule.id),
          eq(trustPassRule.isActive, true),
          sql`${trustPassRule.tokensClaimed} < ${trustPassRule.inventoryCap}`,
        ),
      )
      .returning()

    if (!claimed) {
      return NextResponse.json(DENIED, { status: 403 })
    }
  }

  const token = await signAccessToken({
    ruleId: rule.id,
    contentId: rule.contentId,
    contentType: rule.contentType,
    buyerEmail,
    communityId: requestingCommunityId,
    accessRule: rule.accessRule,
  })

  return NextResponse.json({ authorized: true, token }, { status: 200 })
}
