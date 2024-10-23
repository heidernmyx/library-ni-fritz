"use client";

import React, { useState, useEffect, useRef, createContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  BarChart,
  Package,
  X,
  Calendar,
  BookCopy,
  BookCheck,
  Bell,
AlbumIcon
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

import { signOut } from "next-auth/react";
import { useToast } from "@/hooks/use-toast"; 
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface Notification {
  NotificationID: number;
  Message: string;
  DateSent: string;
  Status: "Unread" | "Read";
}

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
  {
    href: "/admin_dashboard/returnedBooks",
    label: "Returned Books",
    icon: BookCheck,
  },
  {
    href: "/admin_dashboard/genre",
    label: "Genre Management",
    icon:AlbumIcon,
  }
];





export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredNavIndex, setHoveredNavIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const [sessionData, setSessionData] = useState<Session>();
  const [isOpen, setIsOpen] = useState(false);
  const isAnyNavHovered = hoveredNavIndex !== null;

  // Notification States
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasFetchedNotifications = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get("/api/getSession");
        const data: Session = response.data.session;
        
        console.log(data.user)
        setSessionData(data);
        fetchNotifications();
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);


  useEffect(() => {
    if (sessionData?.user?.id) {
      const interval = setInterval(() => {
        checkForNewNotifications();
      }, 10000000); 

      if (!hasFetchedNotifications.current) {
        checkForNewNotifications();
        hasFetchedNotifications.current = true;
      }

      return () => clearInterval(interval);
    }
  }, [sessionData]);

  const fetchNotifications = async () => {
    try {
      const formData = new FormData();
      formData.append("operation", "fetchNotifications");
      formData.append("json", JSON.stringify({ user_id: 83 }));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setNotifications(response.data.notifications);
        console.log(response.data.notifications);
        const unread = response.data.notifications.filter(
          (notif: Notification) => notif.Status === "Unread"
        ).length;
        setUnreadCount(unread);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch notifications."
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const checkForNewNotifications = async () => {
    try {
      const formData = new FormData();
      formData.append(
        "json",
        JSON.stringify({ user_id: sessionData?.user?.id || "" })
      );
      formData.append("operation", "fetchUnreadCount");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      const data = response.data;
      const newUnreadCount = data.unreadCount;

      if (newUnreadCount > unreadCount) {
        toast({
          title: "New Notifications",
          description: `You have ${newUnreadCount} unread notification(s).`,
        });

        setUnreadCount(newUnreadCount);
        fetchNotifications(); // Optionally fetch updated notifications
      } else {
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error("Error checking for new notifications:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const formData = new FormData();
      formData.append(
        "json",
        JSON.stringify({ notificationId: notificationId })
      );
      formData.append("operation", "markNotificationAsRead");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.NotificationID === notificationId ? { ...n, Status: "Read" } : n
        )
      );

      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-400 relative">
      {/* Dynamic Islands Container */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-6">
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
      </div>

      {/* Profile and Notifications Dynamic Island */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-6">
        <div className="bg-white flex flex-col justify-center items-center gap-4 py-3 rounded-2xl shadow-lg">
          {/* Notifications Icon */}
          <div className="relative">
            <Button
              variant="ghost"
              className="p-4 rounded-full text-gray-700 hover:bg-gray-200"
              aria-label="Notifications"
              onClick={() => setIsNotifModalOpen(true)}
            >
              <Bell className="h-8 w-8" />
              {/* Badge for unread notifications */}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
          </div>

          {/* Profile Avatar with Drawer */}
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
                      sessionData?.user?.image ||
                      "/placeholder.svg?height=64&width=64"
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                    {sessionData?.user?.name?.[0] || "AD"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </DrawerTrigger>
            <DrawerContent className="p-6 max-w-[700px] mx-auto rounded-t-3xl bg-white bg-opacity-90 backdrop-blur-lg">
              <DrawerHeader className="text-center">
                <DrawerTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  {sessionData?.user?.name || "Alice Doe"}
                </DrawerTitle>
                <DrawerDescription className="text-gray-600 mt-2">
                  {sessionData?.user?.email || "alice.doe@example.com"}
              
                </DrawerDescription>
              </DrawerHeader>
              <div className="mt-6 flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 ring-4 ring-purple-300 ring-offset-4 ring-offset-pink-100">
                  <AvatarImage
                    src={
                      sessionData?.user?.image ||
                      "/placeholder.svg?height=96&width=96"
                    }
                    alt="User Avatar"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-2xl">
                    {sessionData?.user?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex justify-center space-x-4 mt-6">
                  <Link target='_blank' href={`/profile/${sessionData?.user.id}`}>
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

      {/* Notifications Modal */}
      <Dialog open={isNotifModalOpen} onOpenChange={setIsNotifModalOpen}>
        <DialogContent className="max-w-[70%]" >
          
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <DialogTitle className="text-3xl font-semibold">Notifications</DialogTitle>
            
            </div>

            {/* Modal Body */}
            <DialogDescription className="p-6 space-y-6">
              {notifications.length > 0 ? (
                <ul className="space-y-4 overflow-y-auto h-96 pr-2">
                  {notifications.map((notif) => (
                    <li
                      key={notif.NotificationID}
                      className="flex justify-between items-start p-4 border rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <div>
                        <p className="font-medium text-lg">{notif.Message}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notif.DateSent).toLocaleString()}
                        </p>
                      </div>
                      {notif.Status === "Unread" && (
                        <Button
                          variant="link"
                          className="text-blue-600 text-sm font-medium hover:underline"
                          onClick={() => markAsRead(notif.NotificationID)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 text-lg">
                  You have no new notifications.
                </p>
              )}
            </DialogDescription>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t">
              <Button onClick={() => setIsNotifModalOpen(false)}>
                Close
              </Button>
            </div>
          
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 flex flex-col justify-center items-center">
          {/* {React.cloneElement(children as React.ReactElement, { sessionData })} */}
          {/* <SessionContext.Provider>
            
          </SessionContext.Provider> */}
          <SessionProvider >
            {children}
          </SessionProvider>

        </main>
      </div>
    </div>
  );
}
