import { SignJWT, jwtVerify } from "jose"

// Reuse the Better Auth secret to sign short-lived access tokens returned by
// the /api/verify execution endpoint. Falls back to a dev-only value so the
// preview never crashes, but production must set BETTER_AUTH_SECRET.
const secret = new TextEncoder().encode(
  process.env.BETTER_AUTH_SECRET ?? "trustpass-dev-secret-change-me-please",
)

export interface AccessClaims {
  contentId: string
  contentType: string
  buyerEmail: string
  communityId: string
  ruleId: string
  accessRule: string
}

/**
 * Sign a short-lived access token that the embedded iFrame player can present
 * to unlock the gated Skool content.
 */
export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("trustpass")
    .setSubject(claims.buyerEmail)
    .setExpirationTime("15m")
    .sign(secret)
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, secret, { issuer: "trustpass" })
  return payload as unknown as AccessClaims
}
