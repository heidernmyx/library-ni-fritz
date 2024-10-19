'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Book, Calendar, Bell, LibraryBigIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Session } from "next-auth"
import axios from "axios"

interface Notification {
  NotificationID: number
  Message: string
  DateSent: string
  Status: "Unread" | "Read"
}

const navItems = [
  { href: "/dashboard/catalog", label: "Library", icon: LibraryBigIcon },
  { href: "/dashboard/borrowed", label: "Borrowed", icon: Book },
  { href: "/dashboard/reservations", label: "Reservations", icon: Calendar },
  { href: "#", label: "Notifications", icon: Bell },
]

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const [sessionData, setSessionData] = useState<Session>()
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const hasFetchedNotifications = useRef(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get("/api/getSession")
        const data = response.data
        setSessionData(data.session)
      } catch (error) {
        console.error("Error fetching session:", error)
      }
    }

    fetchSession()
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isNotifModalOpen && sessionData?.user?.id) {
      fetchNotifications()
    }
  }, [isNotifModalOpen, sessionData])

  useEffect(() => {
    if (sessionData?.user?.id) {
      const interval = setInterval(() => {
        checkForNewNotifications()
      }, 60000)

      if (!hasFetchedNotifications.current) {
        checkForNewNotifications()
        hasFetchedNotifications.current = true
      }

      return () => clearInterval(interval)
    }
  }, [sessionData])

  const fetchNotifications = async () => {
    try {
      const formData = new FormData()
      formData.append("operation", "fetchNotifications")
      formData.append(
        "json",
        JSON.stringify({ user_id: sessionData?.user?.id || "" })
      )

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (response.data.success) {
        setNotifications(response.data.notifications)
        console.log(response.data.notifications)
        const unread = response.data.notifications.filter(
          (notif: Notification) => notif.Status === "Unread"
        ).length
        setUnreadCount(unread)
      } else {
        throw new Error(
          response.data.message || "Failed to fetch notifications."
        )
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const checkForNewNotifications = async () => {
    try {
      const formData = new FormData()
      formData.append(
        "json",
        JSON.stringify({ user_id: sessionData?.user?.id || "" })
      )
      formData.append("operation", "fetchUnreadCount")

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      )

      const data = response.data
      const newUnreadCount = data.unreadCount

      if (newUnreadCount > unreadCount) {
        toast({
          title: "New Notifications",
          description: `You have ${newUnreadCount} unread notification(s).`,
        })

        setUnreadCount(newUnreadCount)
      } else {
        setUnreadCount(newUnreadCount)
      }
    } catch (error) {
      console.error("Error checking for new notifications:", error)
    }
  }

  const isAnyHovered = hoveredIndex !== null

  return (
    <div className="flex min-h-screen bg-gray-400 relative">
      <Drawer>
        <DrawerTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
             whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-[35%] z-50 cursor-pointer"
          >
            <Avatar className="h-16 w-16 ring-4 ring-purple-300 ring-offset-4 ring-offset-pink-100">
              <AvatarImage
                src={sessionData?.user?.image || "/avatars/01.png"}
                alt="User Avatar"
              />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white text-xl">
                {sessionData?.user?.name?.[0] || "US"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
        </DrawerTrigger>
        <DrawerContent  className="p-6 max-w-[700px] mx-auto rounded-t-3xl bg-white bg-opacity-90 backdrop-blur-lg">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">   {sessionData?.user?.name || "User"}</DrawerTitle>
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

      <Dialog open={isNotifModalOpen} onOpenChange={setIsNotifModalOpen}>
        <DialogContent className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-7xl max-h-[80%] h-full">
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
                            const formData = new FormData()
                            formData.append(
                              "json",
                              JSON.stringify({
                                notificationId: notif.NotificationID,
                              })
                            )
                            formData.append(
                              "operation",
                              "markNotificationAsRead"
                            )

                            await axios.post(
                              `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
                              formData
                            )

                            setNotifications((prev) =>
                              prev.map((n) =>
                                n.NotificationID === notif.NotificationID
                                  ? { ...n, Status: "Read" }
                                  : n
                              )
                            )
                            setUnreadCount((prev) => prev - 1)
                          } catch (error) {
                            console.error(
                              "Error marking notification as read:",
                              error
                            )
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

      <motion.nav
        initial={{ width: "300px", height: "60px" }}
        animate={{
          width: isAnyHovered ? "320px" : "300px",
          height: isAnyHovered ? "80px" : "60px",
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-lg flex items-center justify-around p-2 z-40",
          ""
        )}
      >
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          const handleClick = (e: React.MouseEvent) => {
            if (item.label === "Notifications") {
              e.preventDefault()
              setIsNotifModalOpen(true)
              fetchNotifications()
            }
          }

          return (
            <div
              key={item.href}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
            >
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
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </Link>
            </div>
          )
        })}
      </motion.nav>


        <main className="flex-1 p-6 flex flex-col justify-center items-center ">
          {children}
        </main>
     
    </div>
  )
}