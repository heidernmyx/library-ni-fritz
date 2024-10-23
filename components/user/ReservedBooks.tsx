"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { AlertCircle, Book, Calendar, User, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";

interface ReservedBook {
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
  ReservationStatus: string;
  Description?: string; // Assuming Description might be available
}

interface Session {
  user: {
    id: number;
    name: string;
    usertype: string;
  };
}

export default function ReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string | null>(null); // State for sorting
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

  const fetchReservedBooks = async () => {
    if (!sessionData) return; 
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("operation", "fetchReservedBooks");

      // Only add user_id if the user is a Registered User
      if (sessionData.user.usertype === "Registered User") {
        const _data = { user_id: sessionData.user.id };
        formData.append("json", JSON.stringify(_data));
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        setReservedBooks(response.data.reserved_books);
      } else {
        setError("Failed to fetch reserved books.");
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservedBooks();
  }, [sessionData]);

  const handleBorrow = async (reservationId: number) => {
    try {
      const formData = new FormData();
      formData.append("operation", "borrowBook");
      formData.append(
        "json",
        JSON.stringify({
          user_id: sessionData?.user?.id,
          reservation_id: reservationId,
        })
      );
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );
      if (response.data.success) {
        toast({
          title: "Book Borrowed",
          description: "Book borrowed successfully.",
        });
        // Refresh the reserved books list after borrowing
        fetchReservedBooks();
      } else {
        toast({
          title: "Failed to Borrow Book",
          description: response.data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error borrowing book:", error);
      toast({
        title: "Error",
        description: "An error occurred while borrowing the book.",
        variant: "destructive",
      });
    }
  };

  // Function to sort reserved books based on the selected option
  const sortReservedBooks = (books: ReservedBook[]) => {
    if (!sortOption) return books;

    const sortedBooks = [...books];

    switch (sortOption) {
      case "title":
        return sortedBooks.sort((a, b) => a.Title.localeCompare(b.Title));
      case "author":
        return sortedBooks.sort((a, b) => a.AuthorName.localeCompare(b.AuthorName));
      case "reservationDate":
        return sortedBooks.sort(
          (a, b) => new Date(a.ReservationDate).getTime() - new Date(b.ReservationDate).getTime()
        );
      case "expirationDate":
        return sortedBooks.sort(
          (a, b) => new Date(a.ExpirationDate).getTime() - new Date(b.ExpirationDate).getTime()
        );
      default:
        return books;
    }
  };

  const filteredAndSortedBooks = useMemo(() => {
    const filtered = reservedBooks.filter(
      (book) =>
        book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortReservedBooks(filtered);
  }, [reservedBooks, searchTerm, sortOption]);

  // Helper function to render book details in the dialog
  const renderBookDetails = (book: ReservedBook) => {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{book.Title}</DialogTitle>
          <DialogDescription className="text-base">by {book.AuthorName}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {/* Replace with actual book image if available */}
            <Image
              src="/assets/gif/dragon.gif"
              alt={book.Title || "Book Image"}
              width={500}
              height={500}
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="space-y-4">
            <p><strong>ISBN:</strong> {book.ISBN}</p>
            <p><strong>Publisher:</strong> {book.ProviderName || "Unknown"}</p>
            <p><strong>Publication Date:</strong> {book.PublicationDate}</p>
            <p><strong>Reservation Date:</strong> {book.ReservationDate}</p>
            <p><strong>Expiration Date:</strong> {book.ExpirationDate}</p>
            <p><strong>Status:</strong> {book.ReservationStatus}</p>
          </div>
        </div>
        {book.Description && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Description</h4>
            <p>{book.Description}</p>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-20">
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
      <Alert variant="destructive" className="mt-20">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
     <div className="flex flex-col bg-white rounded-md mx-auto p-10 max-h-[70vh]">
      <h1 className="text-3xl font-bold">Your Reserved Books</h1>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 w-full">
        <Input
          type="search"
          placeholder="Search reserved books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mb-4 md:mb-0"
          icon={<Search className="h-4 w-4 text-muted-foreground" />}
        />
        <Select onValueChange={(value) => setSortOption(value)} className="w-full max-w-xs">
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="reservationDate">Reservation Date</SelectItem>
            <SelectItem value="expirationDate">Expiration Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reserved Books Grid */}
      {filteredAndSortedBooks.length > 0 ? (
        <ScrollArea className="h-[60vh] w-full">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredAndSortedBooks.map((book) => (
              <Card key={book.ReservationID} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.Title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
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
                          Reserved: {new Date(book.ReservationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Expires: {new Date(book.ExpirationDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold">Status:</span>
                        <p className="text-sm">{book.ReservationStatus}</p>
                      </div>
                      <p className="text-sm">
                        <strong>ISBN:</strong> {book.ISBN}
                      </p>
                      <p className="text-sm">
                        <strong>Published:</strong> {new Date(book.PublicationDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm">
                        <strong>Provider:</strong> {book.ProviderName}
                      </p>
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  {/* View Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Book className="mr-2 h-4 w-4" /> View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      {renderBookDetails(book)}
                      <div className="mt-4">
                        <Button
                          onClick={() => handleBorrow(book.ReservationID)}
                          disabled={
                            book.ReservationStatus !== "Available"
                          }
                          className="w-full"
                        >
                          {book.ReservationStatus === "Available"
                            ? "Borrow"
                            : "Not Available"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Borrow Button for Immediate Action */}
                  {book.ReservationStatus === "Available" ? (
                    <Button
                      onClick={() => handleBorrow(book.ReservationID)}
                      className="w-full"
                    >
                      Borrow
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      {book.ReservationStatus}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <Alert className="mt-10">
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
