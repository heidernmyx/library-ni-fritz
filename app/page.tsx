"use client"

import EntryPoint from "@/components/entrypoint"
import { getServerSession, Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

export default async function Home() {

  const session: Session | null = await getServerSession()

  console.log(session)
  if (!session) {
    // Handle the case where session is null
    return <div>No session available</div>
  }
  return (
    <>
      <SessionProvider>
        <EntryPoint session={ session } />
      </SessionProvider>
    </>
  )
}
