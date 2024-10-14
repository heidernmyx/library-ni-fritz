"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Book, Calendar, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Book {
  ReservationID: number;
  BookID: number;
  Title: string;
  Name: string;
  AuthorName: string;
  ReservationDate: string;
  ExpirationDate: string;
  StatusName: string;
  ISBN: string;
  PublicationDate: string;
  ProviderName: string;
}

interface Session {
  user: {
    id: number;
    name: string;
    usertype: string;
  };
}

export default function UsersReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/getSession");
        if (!response.ok) {
          throw new Error("Failed to fetch session");
        }
        const data = await response.json();
        setSessionData(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  useEffect(() => {
    const fetchReservedBooks = async () => {
      if (!sessionData?.user?.id) return;

      try {
        setLoading(true);
        const _data = { user_id: sessionData.user.id };
        const formData = new FormData();
        formData.append("operation", "fetchReservedBooks");
        formData.append("json", JSON.stringify(_data));

        const response = await axios({
          url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          method: "post",
          data: formData,
        });

        if (response.data.success) {
          setReservedBooks(response.data.reserved_books);
        } else {
          setError("Failed to fetch reserved books.");
        }
      } catch (err: any) {
        setError(
          err.response ? err.response.data.message : "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservedBooks();
  }, [sessionData]);

  const handleStatusChange = async (bookId: number, newStatus: string) => {
    console.log(`Changing status of book ${bookId} to ${newStatus}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <Skeleton key={index} className="h-[250px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Reserved Books</h1>
      {reservedBooks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reservedBooks.map((book) => (
            <Card key={book.ReservationID}>
              <CardHeader>
                <CardTitle className="line-clamp-2">{book.Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Book className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{book.AuthorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{book.Name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Reserved: {book.ReservationDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Expires: {book.ExpirationDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">Status:</span>
                      {sessionData?.user?.usertype === "Registered User" ? (
                        <p className="text-sm">{book.StatusName}</p>
                      ) : (
                        <Select
                          onValueChange={(value) =>
                            handleStatusChange(book.BookID, value)
                          }
                          defaultValue={book.StatusName}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Reserved">Reserved</SelectItem>
                            <SelectItem value="Checked Out">
                              Checked Out
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <p className="text-sm">
                      <strong>ISBN:</strong> {book.ISBN}
                    </p>
                    <p className="text-sm">
                      <strong>Published:</strong> {book.PublicationDate}
                    </p>
                    <p className="text-sm">
                      <strong>Provider:</strong> {book.ProviderName}
                    </p>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Book className="h-4 w-4" />
          <AlertTitle>No Reservations</AlertTitle>
          <AlertDescription>
            You don't have any reserved books at the moment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
