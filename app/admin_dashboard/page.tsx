'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Book } from "lucide-react"

export default function AdminsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      router.push("/admin_dashboard/books")
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="container mx-auto p-4 min-h-screen flex flex-col items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center">
          {/* <div className="w-64 h-96 bg-gray-100 rounded-lg shadow-md flex items-center justify-center"> */}
            <Book 
              className="w-48 h-48 text-primary animate-spin" 
              style={{ animationDuration: '10s', animationTimingFunction: 'linear' }}
            />
          {/* </div> */}
          <div className="mt-4 text-lg font-semibold text-gray-600">Loading library data <span className="animate-pulse">...</span></div>
        </div>
      ) : null}
    </div>
  )
}