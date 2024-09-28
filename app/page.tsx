"use client"

import EntryPoint from "@/components/entrypoint"
import { SessionProvider } from "next-auth/react"

export default async function Home() {

  return (
    <>
      <SessionProvider>
        <EntryPoint/>
      </SessionProvider>
    </>
  )
}
