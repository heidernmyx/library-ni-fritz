"use client";
//? this is the code for the user side of the Library Catalog
//? we'll make some adjustments here na if mag click kas book it will go to a page for the Full Details of that book
//? then proceed with the reservations
//TODO: change the logic here. the reserve button will NOTIFY the librarian about this user's reservation
{
  /*
! SOOOOO bali the reserve button will just pass 
! the session ID and Book Id to the notif of the Librarian
! and will then use the same IDs to confirm the reservation
*/
}
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getSession } from "next-auth/react";
import { Book, BookOpen, Calendar, Hash, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

type Book = {
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
  const [books, setBooks] = useState<Book[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
    };
    fetchSession();
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        { operation: "fetchBooks" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setBooks(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const reserveBook = async (userId: any, bookId: any) => {
    try {
      const _data = { user_id: userId, book_id: bookId };
      const formData = new FormData();
      formData.append("operation", "reserveBook");
      formData.append("json", JSON.stringify(_data));

      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        method: "post",
        data: formData,
      });

      alert(response.data);
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Library Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <AlertDialog key={book.BookID}>
            <AlertDialogTrigger asChild>
              <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="bg-primary h-40 rounded-t-lg flex items-center justify-center">
                    <Book className="w-20 h-20 text-primary-foreground" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg mb-2 line-clamp-1">
                      {book.Title}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" /> {book.AuthorName}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <BookOpen className="w-4 h-4 mr-2" /> Available:{" "}
                      {book.AvailableCopies ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">{book.Title}</h2>
                <p className="flex items-center text-muted-foreground">
                  <User className="w-5 h-5 mr-2" /> {book.AuthorName}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <Hash className="w-5 h-5 mr-2" /> {book.ISBN}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <Calendar className="w-5 h-5 mr-2" /> {book.PublicationDate}
                </p>
                <p className="flex items-center text-muted-foreground">
                  <BookOpen className="w-5 h-5 mr-2" /> Available:{" "}
                  {book.AvailableCopies ?? 0}
                </p>
                {book.Genres && (
                  <div className="flex flex-wrap gap-2">
                    <h1>Genres:</h1>
                    {(Array.isArray(book.Genres)
                      ? book.Genres
                      : [book.Genres]
                    ).map((genre, index) => (
                      <span
                        key={index}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <Button
                  className="w-full"
                  onClick={() => reserveBook(session?.user?.id, book.BookID)}
                  disabled={!session?.user?.id || book.AvailableCopies === 0}
                >
                  {book.AvailableCopies === 0 ? "Not Available" : "Reserve"}
                </Button>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}
