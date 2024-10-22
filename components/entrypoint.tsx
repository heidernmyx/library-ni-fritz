"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress";
import { motion } from 'framer-motion';

const EntryPoint = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const fullText = "Fritz Library digital catalog...";


  useEffect(() => {
    const typeWriterTimer = setTimeout(() => {
      if (displayText.length < fullText.length) {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }
    }, 100); 

    return () => clearTimeout(typeWriterTimer);
  }, [displayText]);

  // Progress Timer
  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 1; 
        } else {
          clearInterval(progressTimer); 
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

    return () => clearInterval(progressTimer); 
  }, [progress, session, router]);

  // Framer Motion variants for letter animation
  const letterVariants = {
    hidden: { opacity: 0, x: 50, rotate: 90 }, // Start position (from right and spinning)
    visible: { 
      opacity: 1, 
      x: 0, 
      rotate: 0, 
      transition: { 
        duration: 0.6, 
        ease: 'easeOut' 
      } 
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { 
        duration: 0.5, 
        ease: 'easeOut', 
        staggerChildren: 0.1, // Stagger each letter's animation
      }
    },
  };

  return (
    <div className='min-h-screen flex justify-center items-center'>
      <motion.div
        className='flex flex-col w-[30vw]'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated letter-by-letter rendering */}
        <motion.div 
          className="flex justify-center mb-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayText.split("").map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="inline-block text-lg font-semibold text-center"
            >
              {letter === " " ? "\u00A0" : letter} {/* Handle space */}
            </motion.span>
          ))}
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <Progress value={progress} />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default EntryPoint;
