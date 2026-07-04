import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMyRules } from "@/app/actions/rules"
import { Dashboard } from "@/components/dashboard"

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")

  const initialRules = await getMyRules()

  return (
    <Dashboard
      user={{ name: session.user.name, email: session.user.email }}
      initialRules={initialRules}
    />
  )
}
