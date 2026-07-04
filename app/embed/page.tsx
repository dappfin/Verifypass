import { EmbedPlayer } from "@/components/embed-player"

export const metadata = {
  title: "TrustPass · Secure Content",
  robots: { index: false, follow: false },
}

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ contentId?: string; communityId?: string; buyerEmail?: string }>
}) {
  const params = await searchParams
  return (
    <EmbedPlayer
      contentId={params.contentId ?? ""}
      communityId={params.communityId ?? ""}
      buyerEmail={params.buyerEmail ?? ""}
    />
  )
}
