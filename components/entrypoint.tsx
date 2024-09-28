"use client"
import React from 'react'
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"


const EntryPoint = () => {
  const { data: session, status} = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(13)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    clearTimeout(timer)
    if (session) {
      router.push('/dashboard')
    }
    else {
      router.push('/auth/signin')
    }
  }, [session, status])

  

  return (
    <div className='min-h-screen flex justify-center items-center'>
      <div className='flex flex-col w-[30vw]'>
        Loading...
        <Progress value={progress} />
      </div>
    </div>
  )
}

export default EntryPoint