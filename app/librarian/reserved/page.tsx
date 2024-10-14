"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Calendar, Hash, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type ReservedBook = {
  ReservationID: number;
  BookID: number;
  Title: string;
  AuthorName: string;
  ReservationDate: string;
  ExpirationDate: string;
  StatusName: string;
  ISBN: string;
  PublicationDate: string;
  ProviderName: string | null;
};

export default function ReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservedBooks = async () => {
      try {
        const session = await getSession();
        const userId = session?.user?.id || null; // Get user ID or set to null

        const formData = new FormData();
        formData.append("operation", "fetchReservedBooks");
        if (userId) {
          formData.append("userId", userId.toString()); // Only append userId if it exists
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          formData
        );

        // Check if reserved_books exists and is an array
        if (Array.isArray(response.data.reserved_books)) {
          setReservedBooks(response.data.reserved_books);
        } else {
          setError("No reserved books found.");
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
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Reserved Books</h1>
      {reservedBooks.length === 0 ? (
        <p className="text-center text-gray-500">You have no reserved books.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservedBooks.map((book) => (
            <Card key={book.ReservationID} className="overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5" />
                  <span className="truncate">{book.Title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <p className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  {book.AuthorName}
                </p>
                <p className="flex items-center text-sm text-muted-foreground">
                  <Hash className="h-4 w-4 mr-2" />
                  {book.ISBN}
                </p>
                <p className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Published: {formatDate(book.PublicationDate)}
                </p>
                <div className="flex justify-between items-center">
                  <Badge
                    variant={
                      book.StatusName === "Active" ? "default" : "secondary"
                    }
                  >
                    {book.StatusName}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Expires: {formatDate(book.ExpirationDate)}
                  </span>
                </div>
                {book.ProviderName && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Provider: {book.ProviderName}
                  </p>
                )}
                <section className="flex-1 flex w-full justify-center items-center p-4">
                  <Button>Pick up | Borrow Book</Button>
                </section>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
