"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Calendar, Bell, User } from "lucide-react";
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

const navItems = [
  { href: "/user", label: "Dashboard", icon: User },
  { href: "/user/borrowed", label: "Borrowed", icon: Book },
  { href: "/user/reservations", label: "Reservations", icon: Calendar },
  { href: "/user/notifications", label: "Notifications", icon: Bell },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  //? Determine if any icon is hovered/selected
  const isAnyHovered = hoveredIndex !== null;

  return (
    <div className="min-h-screen bg-gray-100 px-4 md:px-0 relative">
      {/* Profile Avatar with Drawer */}
      <Drawer>
        <DrawerTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed top-8 flex justify-center items-center flex-1 w-full -translate-x-1/2 z-60 cursor-pointer"
          >
            <Avatar className="h-10  w-10  ">
              <AvatarImage src="/avatars/01.png" alt="User Avatar" />
              <AvatarFallback className="bg-green-300">JD</AvatarFallback>
            </Avatar>
          </motion.div>
        </DrawerTrigger>
        <DrawerContent className="w-full max-w-[600px]">
          <DrawerHeader>
            <DrawerTitle>Profile</DrawerTitle>
            <DrawerClose className="absolute top-4 right-4" />
          </DrawerHeader>
          <DrawerDescription>
            {/* Profile Content */}
            <div className="flex flex-col items-center space-y-6 mt-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/avatars/01.png" alt="User Avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">John Doe</h2>
              <p className="text-gray-600">johndoe@example.com</p>
              <Link href="/user/profile">
                <Button className="mt-4">View Profile</Button>
              </Link>
              <Button variant="destructive" className="mt-2">
                Logout
              </Button>
            </div>
          </DrawerDescription>
        </DrawerContent>
      </Drawer>

      {/* Dynamic Island Navbar */}
      <motion.nav
        initial={{ width: "300px", height: "60px" }}
        animate={{
          width: isAnyHovered ? "320px" : "300px",
          height: isAnyHovered ? "80px" : "60px",
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-around p-2 z-50",
          ""
        )}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <div
              key={item.href}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
            >
              {/* Label Animation */}
              <AnimatePresence>
                {hoveredIndex === index && !isMobile && (
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full mb-4 px-4 py-2 bg-gray-700 text-white text-sm rounded-full whitespace-nowrap z-60"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              <Link href={item.href}>
                <motion.div
                  whileHover={{
                    scale: 1.5,
                    transition: { type: "spring", stiffness: 300, damping: 10 },
                  }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    !isAnyHovered
                      ? {
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={
                    !isAnyHovered
                      ? {
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "loop",
                          ease: "easeInOut",
                        }
                      : {}
                  }
                  className="flex"
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "p-2 rounded-full transition-transform transform",
                      isActive ? "bg-muted" : "hover:bg-gray-200"
                    )}
                    aria-label={item.label}
                  >
                    <Icon className="h-6 w-6" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          );
        })}
      </motion.nav>

      {/* Main Content */}
      <main className=" flex justify-center items-center pt-28 md:pt-32 max-w-4xl mx-auto">
        {children}
      </main>
    </div>
  );
}
