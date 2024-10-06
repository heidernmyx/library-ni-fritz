"use client"
import React from 'react'
import { useSession } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';
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
      alert(true)
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



  // const [progress, setProgress] = useState(0);
  // const [isPending, startTransition] = useTransition(); // Track page transitions
  // const router = useRouter();

  // const handleNavigation = (url: string) => {
  //   setProgress(20); // Set initial progress
  //   startTransition(() => {
  //     router.push(url); // Trigger navigation
  //   });
  // };

  // // Simulate progress completion after navigation
  // useEffect(() => {
  //   if (isPending) {
  //     setProgress(50); // Midway progress (optional, just for visual effect)
  //     setTimeout(() => setProgress(100), 500); // Simulate full completion
  //   } else {
  //     setTimeout(() => setProgress(0), 1000); // Reset after completion
  //   }
  // }, [isPending]);

  // return (
  //   <div className="fixed top-0 left-0 w-full">
  //     <Progress value={progress} />
  //     {/* Example button to trigger navigation */}
  //     <button onClick={() => handleNavigation("/next-page")}>
  //       Navigate to Next Page
  //     </button>
  //   </div>
  // );