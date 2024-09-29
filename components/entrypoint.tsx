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

  console.log("yaw ng a sesion",session)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    clearTimeout(timer)
    if (session) {
      alert(true)
      console.log(" bullshit: ",session.user)
      router.push('/dashboard')
    }
    else if (!session) {
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