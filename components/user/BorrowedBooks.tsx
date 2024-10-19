"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Book, Calendar, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface BorrowedBook {
  BorrowID: number;
  BookID: number;
  Title: string;
  AuthorName: string;
  Name: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate: string | null;
  StatusName: string;
  ISBN: string;
  PublicationDate: string;
  BorrowStatus: string;
  ProviderName: string;
  PenaltyFees: number;
}

interface Session {
  user: {
    id: number;
    name: string;
    usertype: string;
  };
}

export default function BorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const { toast } = useToast(); // Initialize toast

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
        setError("Failed to fetch session data.");
      }
    };

    fetchSession();
  }, []);

  const fetchBorrowedBooks = async () => {
    if (!sessionData) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("operation", "fetchBorrowedBooks");

      if (sessionData.user.usertype === "Registered User") {
        const _data = { user_id: sessionData.user.id };
        formData.append("json", JSON.stringify(_data));
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        setBorrowedBooks(response.data.borrowed_books);
      } else {
        setError("Failed to fetch borrowed books.");
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [sessionData]);

  const handleReturn = async (borrowId: number) => {
    try {
      const formData = new FormData();
      formData.append("operation", "returnBook");
      formData.append(
        "json",
        JSON.stringify({
          user_id: sessionData?.user?.id,
          borrow_id: borrowId,
        })
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );
      if (response.data.success) {
        const penaltyFees = response.data.penalty_fees;
        if (penaltyFees > 0) {
          toast({
            title: "Book Returned",
            description: `Book returned successfully. Penalty fee: ₱${penaltyFees}`,
          });
        } else {
          toast({
            title: "Book Returned",
            description: "Book returned successfully.",
          });
        }
        fetchBorrowedBooks();
      } else {
        toast({
          title: "Failed to Return Book",
          description: response.data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast({
        title: "Error",
        description: "An error occurred while returning the book.",
        variant: "destructive",
      });
    }
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
    <div className="flex flex-col bg-white rounded-md mx-auto p-10 max-h-[90vh]">
      <h1 className="text-3xl font-bold">Your Borrowed Books</h1>
      {borrowedBooks.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {borrowedBooks.map((book) => (
            <Card key={book.BorrowID}>
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
                        Borrowed On: {book.BorrowDate}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Due On: {book.DueDate}</span>
                    </div>
                    {book.ReturnDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Returned On: {book.ReturnDate}
                        </span>
                      </div>
                    )}
                    {book.PenaltyFees > 0 && (
                      <p className="text-sm text-red-500">
                        <strong>Penalty Fees:</strong> ₱{book.PenaltyFees}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">Status:</span>
                      <p className="text-sm">{book.BorrowStatus}</p>
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
              <CardFooter>
                {book.BorrowStatus === "Borrowed" && !book.ReturnDate ? (
                  <Button
                    onClick={() => handleReturn(book.BorrowID)}
                    className="w-full"
                  >
                    Return
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    Returned
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Book className="h-4 w-4" />
          <AlertTitle>No Borrowed Books</AlertTitle>
          <AlertDescription>
            You don't have any borrowed books at the moment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
