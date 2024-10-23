'use client'


import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Book, MapPin, Mail, Phone, Calendar, Bell } from 'lucide-react'

interface ProfilePageProps {
  params: {
    id: string;
  };
}

interface UserProps {
  UserID: number;
  Fname: string;
  RoleName: string;
  Email: string;
  Phone: string;
  Street?: string;
  City?: string;
  State?: string;
  Country?: string;
  PostalCode?: string;
}

interface BorrowedBook {
  Title: string;
  BorrowID: number;
  BorrowStatus: string;
  BookID: number;
  Fname: string;
  AuthorName: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate?: string;
  StatusName: string;
  ISBN: string;
  PublicationDate: string;
  ProviderName: string;
  PenaltyFees: number;
}

interface Notification { 
  NotificationID: number;
  Fname: string;
  Message: string;
  DateSent: string;
  NotificationTypeName: string;
  Status: string;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params;
  const userID = parseInt(id, 10);

  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchUser = async (id: number) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users.php`, {
        params: {
          operation: "get_user_details",
          json: JSON.stringify({ user_id: id })
        }
      });
      if (response.data.success) {
        setUser(response.data.user);
        fetchBorrowedBooks(response.data.user.RoleName, id); // Only fetch borrowed books if user data is successfully fetched
      } else {
        setError('Failed to fetch user details.');
      }
    } catch (err) {
      // Catch real errors (e.g., network issues)
      setError('An error occurred while fetching the user data.');
    } finally {
      setLoading(false); // Make sure to stop loading
    }
  };

  const fetchBorrowedBooks = async (role: string, userID: number) => {
    try {
      const formData = new FormData();
      formData.append("operation", "fetchBorrowedBooks");
      formData.append("json", JSON.stringify({ user_id: userID, role: role }));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );
      if (response.data.success) {
        setBorrowedBooks(response.data.borrowed_books);
        setNotifications(response.data.notifications);
      } else {
        setError("Failed to fetch borrowed books.");
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.");
    }
  }

  useEffect(() => {
    fetchUser(userID);
  }, [userID]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-64 h-64 mb-4 shadow-md">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.Fname}`} />
                    <AvatarFallback>{user?.Fname.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold mb-2">{user?.Fname || "Unknown User"}</h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{user?.RoleName || "Unknown Role"}</p>
                  <Button className="w-full mb-4 shadow-sm">Edit profile</Button>
                  <div className="w-full space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    {user?.Email ? (
                      <p className="flex items-center gap-2">
                        <Mail size={16} />
                        <span>{user.Email}</span>
                      </p>
                    ) : null}
                    {user?.Phone ? (
                      <p className="flex items-center gap-2">
                        <Phone size={16} />
                        <span>{user.Phone}</span>
                      </p>
                    ) : null}
                    {user?.Street || user?.City || user?.State || user?.Country ? (
                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>
                          {user?.Street || "No Address"}, {user?.City || ""}, {user?.State || ""}, {user?.Country || ""}
                        </span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>Address not available</span>
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Joined on {new Date().toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-3 space-y-8">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Borrowed Books</CardTitle>
                <Button variant="outline" size="sm" className="shadow-sm">View all</Button>
              </CardHeader>
              <CardContent>
                {borrowedBooks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {borrowedBooks.slice(0, 6).map((book, index) => (
                      <Card key={index} className="shadow-md">
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 truncate">{book.Title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">by {book.AuthorName}</p>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1 text-sm">
                              <Book size={16} />
                              <span className="truncate">{book.ProviderName}</span>
                            </span>
                            <Badge variant="secondary" className="shadow-sm">{book.StatusName}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>No borrowed books found.</p>
                )}
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <ul className="space-y-4">
                    {notifications.map((notification, index) => (
                      <li key={index} className="p-4 rounded-lg shadow-md bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-start gap-4">
                          <Bell className="mt-1 text-gray-600 dark:text-gray-400" size={20} />
                          <div className="flex-1">
                            <p className="font-medium">{notification.Message}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(notification.DateSent).toLocaleDateString()}
                              </p>
                              <Badge variant="outline" className="shadow-sm">
                                {notification.NotificationTypeName}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No notifications found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Skeleton className="w-full h-96" />
        </div>
        <div className="lg:col-span-3 space-y-8">
          <Skeleton className="w-full h-64" />
        </div>
      </div>
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-8">
      <div className="p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={24} />
          <p className="text-lg font-semibold">{message}</p>
        </div>
      </div>
    </div>
  )
}
