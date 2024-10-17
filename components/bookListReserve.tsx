"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Book, BookOpen, Calendar, Hash, User, Search } from "lucide-react";
import { getSession } from "next-auth/react";

type BookType = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string | string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
  TotalCopies?: number;
  AvailableCopies: number;
};

export default function BookListReserve() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userReservations, setUserReservations] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingReserve, setLoadingReserve] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      if (sessionData?.user?.id) {
        fetchUserReservations(sessionData.user.id);
      }
    };
    fetchSession();
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        { operation: "fetchBooks" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setBooks(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch books.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async (userId: any) => {
    try {
      const _data = { user_id: userId };
      const formData = new FormData();
      formData.append("operation", "fetchReservedBooks");
      formData.append("json", JSON.stringify(_data));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        const reservedBooks = response.data.reserved_books.map(
          (reservation: any) => reservation.BookID
        );
        setUserReservations(reservedBooks);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reserved books.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error fetching reserved books.",
        variant: "destructive",
      });
    }
  };

  const reserveBook = async (userId: any, bookId: any) => {
    try {
      setLoadingReserve(true);
      const _data = { user_id: userId, book_id: bookId };
      const formData = new FormData();
      formData.append("operation", "reserveBook");
      formData.append("json", JSON.stringify(_data));

      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        method: "post",
        data: formData,
      });

      const data = response.data;
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || "Book reserved successfully.",
        });
        // Refetch reservations to update the UI
        fetchUserReservations(userId);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to reserve book.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while reserving the book.",
        variant: "destructive",
      });
    } finally {
      setLoadingReserve(false);
    }
  };

  const filteredBooks = books.filter((book) =>
    book.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-4 md:mb-0">
          Library Catalog
        </h1>
        <div className="flex items-center space-x-2">
          <Input
            className="w-64"
            placeholder="Search books..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[75vh]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <AlertDialog key={book.BookID}>
                <AlertDialogTrigger asChild>
                  <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="bg-primary/10 p-6">
                      <CardTitle className="text-2xl font-bold line-clamp-2">
                        {book.Title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-primary" />
                          <span className="font-semibold">
                            {book.AuthorName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span>
                            Available: {book.AvailableCopies ?? 0} copies
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">{book.Title}</h2>
                    <div className="flex items-center text-muted-foreground">
                      <User className="w-5 h-5 mr-2" /> {book.AuthorName}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Hash className="w-5 h-5 mr-2" /> {book.ISBN}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-5 h-5 mr-2" />{" "}
                      {book.PublicationDate}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="w-5 h-5 mr-2" /> Available:{" "}
                      {book.AvailableCopies ?? 0} copies
                    </div>
                    {book.Genres && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        <h3 className="font-semibold">Genres:</h3>
                        {(Array.isArray(book.Genres)
                          ? book.Genres
                          : [book.Genres]
                        ).map((genre, index) => (
                          <Badge key={index} variant="secondary">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button
                      className="w-full"
                      onClick={() =>
                        reserveBook(session?.user?.id, book.BookID)
                      }
                      disabled={
                        !session?.user?.id ||
                        book.AvailableCopies === 0 ||
                        userReservations.includes(book.BookID) ||
                        loadingReserve
                      }
                    >
                      {loadingReserve
                        ? "Reserving..."
                        : userReservations.includes(book.BookID)
                        ? "Already Reserved"
                        : book.AvailableCopies === 0
                        ? "Not Available"
                        : "Reserve"}
                    </Button>
                  </div>
                </AlertDialogContent>
              </AlertDialog>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
