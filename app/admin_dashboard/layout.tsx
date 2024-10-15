"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  BarChart,
  Settings,
  Package,
  X,
  Calendar,
  BookCopy,
} from "lucide-react";
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
import axios from "axios";

import { getSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/admin_dashboard/books", label: "Manage Books", icon: BookOpen },
  { href: "/admin_dashboard/users", label: "Manage Users", icon: Users },
  { href: "/admin_dashboard/reports", label: "System Reports", icon: BarChart },
  {
    href: "/admin_dashboard/reserved",
    label: "Reserved Books",
    icon: Calendar,
  },
  {
    href: "/admin_dashboard/book-provider",
    label: "Book Provider",
    icon: Package,
  },
  {
    href: "/admin_dashboard/borrowed",
    label: "Borrowed Books",
    icon: BookCopy,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isAnyNavHovered = hoveredNavIndex !== null;

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      setSession(session);
    };
    fetchSession();
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Dynamic Islands Container */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-6">
        {/* Navigation Dynamic Island */}
        <div className="bg-white flex flex-col justify-center items-center gap-7 py-3 rounded-2xl shadow-lg">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{
                    scale: 1.3,
                    rotate: 10,
                    transition: { type: "spring", stiffness: 300, damping: 10 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    !isAnyNavHovered
                      ? {
                          scale: [1, 1.05, 1],
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
                      "p-4 rounded-full transition-transform transform relative overflow-hidden",
                      isActive
                        ? "text-white"
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
                    <Icon className="h-8 w-8 relative z-10" />
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

        <div className="  bg-opacity-40 backdrop-blur-lg shadow-xl  border-opacity-20">
          <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer flex justify-center"
              >
                <Avatar className="h-16 w-16 ring-4 ring-purple-300 ring-offset-4 ring-offset-pink-100">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "/placeholder.svg?height=64&width=64"
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                    {session?.user?.name?.[0] || "AD"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </DrawerTrigger>
            <DrawerContent className="p-6 max-w-[700px] mx-auto rounded-t-3xl bg-white bg-opacity-90 backdrop-blur-lg">
              <DrawerHeader className="text-center">
                <DrawerTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  {session?.user?.name || "Alice Doe"}
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 mt-2">
                  {session?.user?.email || "alice.doe@example.com"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="mt-6 flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 ring-4 ring-purple-300 ring-offset-4 ring-offset-pink-100">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "/placeholder.svg?height=96&width=96"
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl">
                    {session?.user?.name?.[0] || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex justify-center space-x-4 mt-6">
                  <Link href="/admin/profile">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-600 hover:bg-purple-50 transition-all duration-300"
                    onClick={() => signOut()}
                  >
                    Logout
                  </Button>
                </div>
              </div>
              <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DrawerClose>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 flex flex-col justify-center items-center">
          {children}
        </main>
      </div>
    </div>
  );
}
