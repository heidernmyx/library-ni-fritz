"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Book, Calendar, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Session } from "next-auth";
import axios from "axios";

// Define the type for notifications
interface Notification {
  NotificationID: number;
  Message: string;
  DateSent: string;
  Status: "Unread" | "Read";
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: User },
  { href: "/dashboard/borrowed", label: "Borrowed", icon: Book },
  { href: "/dashboard/reservations", label: "Reservations", icon: Calendar },
  { href: "#", label: "Notifications", icon: Bell },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const [sessionData, setSessionData] = useState<Session>();
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  const hasFetchedNotifications = useRef(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get("/api/getSession");
        const data = response.data;
        setSessionData(data.session);
        // alert(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch notifications when the modal opens
  useEffect(() => {
    if (isNotifModalOpen && sessionData?.user?.id) {
      fetchNotifications();
    }
  }, [isNotifModalOpen, sessionData]);

  // Periodically check for new unread notifications
  useEffect(() => {
    if (sessionData?.user?.id) {
      const interval = setInterval(() => {
        checkForNewNotifications();
      }, 60000); // Check every 60 seconds

      // Initial check
      if (!hasFetchedNotifications.current) {
        checkForNewNotifications();
        hasFetchedNotifications.current = true;
      }

      return () => clearInterval(interval);
    }
  }, [sessionData]);

  const fetchNotifications = async () => {
    try {
      // Create a new FormData instance
      const formData = new FormData();

      // Append the operation and user_id to the form data
      formData.append("operation", "fetchNotifications");
      formData.append(
        "json",
        JSON.stringify({ user_id: sessionData?.user?.id || "" })
      );

      // Make the POST request to the API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure the content type is set correctly
          },
        }
      );

      // Check if the response is successful
      if (response.data.success) {
        setNotifications(response.data.notifications);
        console.log(response.data.notifications);
        // Update unread count
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
      // alert(sessionData?.user?.id);
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
        // Display toast notification
        toast({
          title: "New Notifications",
          description: `You have ${newUnreadCount} unread notification(s).`,
        });

        // Update unread count
        setUnreadCount(newUnreadCount);
      } else {
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error("Error checking for new notifications:", error);
    }
  };

  //   try {
  //     const formData = new FormData();
  //     formData.append("notification_id", notificationId.toString());
  //     formData.append("operation", "markNotificationAsRead");

  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_API_URL}/notification.php`,
  //       formData
  //     );

  //     setNotifications((prev) =>
  //       prev.map((n) =>
  //         n.NotificationID === notificationId ? { ...n, Status: "Read" } : n
  //       )
  //     );

  //     setUnreadCount((prev) => prev - 1);
  //   } catch (error) {
  //     console.error("Error marking notification as read:", error);
  //   }
  // };

  // Determine if any icon is hovered/selected
  const isAnyHovered = hoveredIndex !== null;

  return (
    <div className="min-h-screen  bg-gray-400 px-4 md:px-0 relative">
      {/* Profile Avatar with Drawer */}
      <Drawer>
        <DrawerTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed top-8 flex justify-center items-center flex-1 w-full -translate-x-1/2 z-60 cursor-pointer"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={sessionData?.user?.image || "/avatars/01.png"}
                alt="User Avatar"
              />
              <AvatarFallback className="bg-green-300">
                {sessionData?.user?.name?.[0] || "JD"}
              </AvatarFallback>
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
                <AvatarImage
                  src={sessionData?.user?.image || "/avatars/01.png"}
                  alt="User Avatar"
                />
                <AvatarFallback>
                  {sessionData?.user?.name?.[0] || "JD"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold">
                {sessionData?.user?.name || "John Doe"}
              </h2>
              <p className="text-gray-600">
                {sessionData?.user?.email || "johndoe@example.com"}
              </p>
              <Link href="/user/profile">
                <Button className="mt-4">View Profile</Button>
              </Link>
              <Button
                variant="destructive"
                className="mt-2"
                onClick={() => signOut()}
              >
                Logout
              </Button>
            </div>
          </DrawerDescription>
        </DrawerContent>
      </Drawer>

      {/* Notifications Modal */}
      <Dialog open={isNotifModalOpen} onOpenChange={setIsNotifModalOpen}>
        <DialogContent className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-7xl max-h-[90%] h-full">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {notifications.length > 0 ? (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <li
                    key={notif.NotificationID}
                    className="p-2 border rounded-lg"
                  >
                    <p className="font-semibold">{notif.Message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(notif.DateSent).toLocaleString()}
                    </p>
                    {notif.Status === "Unread" && (
                      <Button
                        variant="link"
                        className="text-blue-500 text-sm"
                        onClick={async () => {
                          try {
                            const formData = new FormData();
                            
                            formData.append(
                    "json", JSON.stringify({ notificationId: notif.NotificationID })
                               );
                            formData.append(
                              "operation",
                              "markNotificationAsRead"
                            );

                            await axios.post(
                              `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
                              formData
                            );

                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.NotificationID === notif.NotificationID
                                  ? { ...n, Status: "Read" }
                                  : n
                              )
                            );
                            // Update unread count
                            setUnreadCount((prev) => prev - 1);
                          } catch (error) {
                            console.error(
                              "Error marking notification as read:",
                              error
                            );
                          }
                        }}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No notifications available.</p>
            )}
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setIsNotifModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

          const handleClick = (e: React.MouseEvent) => {
            if (item.label === "Notifications") {
              e.preventDefault();
              setIsNotifModalOpen(true);
              fetchNotifications();
            }
          };

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
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 10,
                    },
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
                      "p-2 rounded-full transition-transform transform relative",
                      isActive ? "bg-muted" : "hover:bg-gray-200"
                    )}
                    aria-label={item.label}
                    onClick={handleClick}
                  >
                    <Icon className="h-6 w-6" />
                    {/* Badge for unread notifications */}
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>
            </div>
          );
        })}
      </motion.nav>

      {/* Main Content */}
      <main className="flex justify-center items-center w-full h-full">{children}</main>
    </div>
  );
}
