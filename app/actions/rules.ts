"use server"

import { randomUUID } from "crypto"
import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { trustPassRule, type TrustPassRule } from "@/lib/db/schema"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export interface CreateRuleInput {
  creatorMemberId: string
  creatorEmail: string
  creatorCommunityId: string
  resellerCommunityId: string
  contentType: string
  contentId: string
  accessRule: string
  inventoryCap: number
  windowStartsAt?: string | null
  windowExpiresAt?: string | null
}

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * Rules owned by the signed-in master account (Owner Panel).
 */
export async function getMyRules(): Promise<TrustPassRule[]> {
  const userId = await getUserId()
  return db
    .select()
    .from(trustPassRule)
    .where(eq(trustPassRule.userId, userId))
    .orderBy(desc(trustPassRule.createdAt))
}

/**
 * Rules where one of the caller's communities is the authorized reseller
 * (Partner Content & Claims / Reseller Panel). Matched by community id, which
 * is why this is not scoped to the owner userId.
 */
export async function getPartnerRules(
  resellerCommunityId: string,
): Promise<TrustPassRule[]> {
  await getUserId()
  const target = resellerCommunityId.trim()
  if (!target) return []
  return db
    .select()
    .from(trustPassRule)
    .where(
      and(
        eq(trustPassRule.resellerCommunityId, target),
        eq(trustPassRule.isActive, true),
      ),
    )
    .orderBy(desc(trustPassRule.createdAt))
}

export async function createRule(
  input: CreateRuleInput,
): Promise<ActionResult<TrustPassRule>> {
  const userId = await getUserId()

  // --- Validation ---------------------------------------------------------
  const required = [
    input.creatorMemberId,
    input.creatorEmail,
    input.creatorCommunityId,
    input.resellerCommunityId,
    input.contentType,
    input.contentId,
    input.accessRule,
  ]
  if (required.some((v) => !v || !String(v).trim())) {
    return { ok: false, error: "All identity and content fields are required." }
  }

  if (!["course", "workshop", "summit", "bundle"].includes(input.contentType)) {
    return { ok: false, error: "Invalid content type." }
  }
  if (!["one_time", "lifetime", "time_limited"].includes(input.accessRule)) {
    return { ok: false, error: "Invalid access rule." }
  }

  let windowStartsAt: Date | null = null
  let windowExpiresAt: Date | null = null
  if (input.accessRule === "time_limited") {
    if (!input.windowStartsAt || !input.windowExpiresAt) {
      return { ok: false, error: "Time-limited rules require start and end dates." }
    }
    windowStartsAt = new Date(input.windowStartsAt)
    windowExpiresAt = new Date(input.windowExpiresAt)
    if (windowExpiresAt <= windowStartsAt) {
      return { ok: false, error: "End date must be after the start date." }
    }
  }

  const cap = Number.isFinite(input.inventoryCap)
    ? Math.max(0, Math.min(100, Math.trunc(input.inventoryCap)))
    : 0

  const [row] = await db
    .insert(trustPassRule)
    .values({
      id: randomUUID(),
      userId,
      creatorMemberId: input.creatorMemberId.trim(),
      creatorEmail: input.creatorEmail.trim().toLowerCase(),
      creatorCommunityId: input.creatorCommunityId.trim(),
      resellerCommunityId: input.resellerCommunityId.trim(),
      contentType: input.contentType,
      contentId: input.contentId.trim(),
      accessRule: input.accessRule,
      inventoryCap: cap,
      tokensClaimed: 0,
      windowStartsAt,
      windowExpiresAt,
      isActive: true,
    })
    .returning()

  revalidatePath("/")
  return { ok: true, data: row }
}

export async function revokeRule(id: string): Promise<ActionResult> {
  const userId = await getUserId()
  const [row] = await db
    .update(trustPassRule)
    .set({ isActive: false })
    .where(and(eq(trustPassRule.id, id), eq(trustPassRule.userId, userId)))
    .returning()
  if (!row) return { ok: false, error: "Rule not found." }
  revalidatePath("/")
  return { ok: true, data: null }
}
