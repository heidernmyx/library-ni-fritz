"use client";
// TODO: Rename to layout.tsx for librarian

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, BarChart, Settings, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { getSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/librarian/books", label: "Manage Books", icon: BookOpen },
  { href: "/librarian/users", label: "Manage Users", icon: Users },
  { href: "/librarian/reports", label: "Reports", icon: BarChart },
  { href: "/librarian/reserved", label: "Reserved Book", icon: Calendar },
];

export default function LibrarianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const pathname = usePathname();

  const isAnyNavHovered = hoveredNavIndex !== null;

  return (
    <div className="flex min-h-screen bg-gray-400 relative">
      {/* Dynamic Islands Container */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4">
        {/* Navigation Dynamic Island */}
        <div className="bg-white flex flex-col justify-center items-center gap-4 py-2 rounded-xl shadow-lg">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{
                    scale: 1.2,
                    rotate: 8,
                    transition: { type: "spring", stiffness: 300, damping: 10 },
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    !isAnyNavHovered
                      ? {
                          scale: [1, 1.03, 1],
                        }
                      : {}
                  }
                  transition={
                    !isAnyNavHovered
                      ? {
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }
                      : {}
                  }
                  className="flex relative"
                  onMouseEnter={() => setHoveredNavIndex(index)}
                  onMouseLeave={() => setHoveredNavIndex(null)}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "p-2 rounded-full transition-transform transform relative overflow-hidden",
                      isActive
                        ? "bg-blue-500 text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    )}
                    aria-label={item.label}
                  >
                    {/* Animated Background */}
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <Icon className="h-6 w-6 relative z-10" />
                  </Button>

                  {/* Floating Label */}
                  <AnimatePresence>
                    {hoveredNavIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-full ml-2 bg-gray-800 text-white text-sm px-2 py-1 rounded-md whitespace-nowrap"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>
        {/* Profile Dynamic Island */}
        <div className="mt-4">
          <Drawer>
            <DrawerTrigger asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center items-center rounded-full p-2 cursor-pointer relative overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full"
                  initial={{ opacity: 0, scale: 1 }}
                  animate={{ opacity: 0.7, scale: 1.2 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "mirror",
                    duration: 4,
                    ease: "easeInOut",
                  }}
                />
                <Avatar className="h-12 w-12 relative z-10">
                  <AvatarImage src="/avatars/01.png" alt="User Avatar" />
                  <AvatarFallback className="bg-green-300">JD</AvatarFallback>
                </Avatar>
              </motion.div>
            </DrawerTrigger>
            <DrawerContent className="w-full max-w-[400px]">
              <DrawerHeader>
                <DrawerTitle>Profile</DrawerTitle>
                <DrawerClose className="absolute top-4 right-4" />
              </DrawerHeader>
              <DrawerDescription>
                {/* Profile Content */}
                <div className="flex flex-col items-center space-y-6 mt-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/avatars/01.png" alt="User Avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-semibold">John Doe</h2>
                  <p className="text-gray-600">johndoe@example.com</p>
                  <Link href="/librarian/profile">
                    <Button className="mt-4">View Profile</Button>
                  </Link>
                  <Button
                    onClick={() => signOut()}
                    variant="destructive"
                    className="mt-2"
                  >
                    Logout
                  </Button>
                </div>
              </DrawerDescription>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ">
        <main className="flex-1 p-6 flex flex-col justify-center items-center">
          {children}
        </main>
      </div>
    </div>
  );
}
