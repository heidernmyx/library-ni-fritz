'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpen, User, Lock } from 'lucide-react'

export default function LibrarySystem() {
  const [activeForm, setActiveForm] = useState<'login' | 'register' | null>(null)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4 overflow-hidden">
      
      {/* Floating Icons */}
      <FloatingIcons />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10"
      >
        <motion.div 
          className="flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <BookOpen className="w-12 h-12 text-indigo-600 mr-2 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-800">Library System</h1>
        </motion.div>

        <div className="flex justify-center space-x-4 mb-6">
          <Button 
            onClick={() => setActiveForm('login')}
            variant={activeForm === 'login' ? 'default' : 'outline'}
            className="flex items-center space-x-2 transition-transform transform hover:scale-105"
          >
            <User className="w-5 h-5" />
            <span>Login</span>
          </Button>
          <Button 
            onClick={() => setActiveForm('register')}
            variant={activeForm === 'register' ? 'default' : 'outline'}
            className="flex items-center space-x-2 transition-transform transform hover:scale-105"
          >
            <Lock className="w-5 h-5" />
            <span>Register</span>
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeForm === 'login' && (
            <LoginForm key="login" />
          )}
          {activeForm === 'register' && (
            <RegisterForm key="register" />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function LoginForm() {
  return (
    <motion.form 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="relative">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email" 
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <div className="relative">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Enter your password" 
          className="pl-10"
        />
        <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
      >
        Login
      </Button>
    </motion.form>
  )
}

function RegisterForm() {
  return (
    <motion.form 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="relative">
        <Label htmlFor="name">Full Name</Label>
        <Input 
          id="name" 
          type="text" 
          placeholder="Enter your full name" 
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <div className="relative">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="Enter your email" 
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <div className="relative">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password" 
          placeholder="Create a password" 
          className="pl-10"
        />
        <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <div className="relative">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input 
          id="confirm-password" 
          type="password" 
          placeholder="Confirm your password" 
          className="pl-10"
        />
        <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        Register
      </Button>
    </motion.form>
  )
}

function FloatingIcons() {
  const icons = [
    { id: 1, icon: <BookOpen className="w-8 h-8 text-indigo-300 opacity-50" />, top: '10%', left: '20%', duration: 20 },
    { id: 2, icon: <BookOpen className="w-6 h-6 text-purple-300 opacity-40" />, top: '30%', left: '70%', duration: 25 },
    { id: 3, icon: <BookOpen className="w-10 h-10 text-indigo-200 opacity-30" />, top: '60%', left: '40%', duration: 30 },
    { id: 4, icon: <BookOpen className="w-7 h-7 text-purple-200 opacity-35" />, top: '80%', left: '15%', duration: 22 },
    { id: 5, icon: <BookOpen className="w-5 h-5 text-indigo-100 opacity-20" />, top: '50%', left: '80%', duration: 18 },
  ]

  return (
    <>
      {icons.map(icon => (
        <motion.div
          key={icon.id}
          className="absolute"
          style={{ top: icon.top, left: icon.left }}
          animate={{
            y: [0, -20, 0],
            x: [0, 20, 0],
            rotate: [0, 360, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: icon.duration,
            ease: 'easeInOut'
          }}
        >
          {icon.icon}
        </motion.div>
      ))}
    </>
  )
}
