"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"

const EntryPoint = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 1; 
        } else {
          clearInterval(timer); 
          return prev;
        }
      });
    }, 30); 

    if (progress === 100) {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth/signin');
      }
    }

    return () => clearInterval(timer); 
  }, [progress, session, router]);

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
