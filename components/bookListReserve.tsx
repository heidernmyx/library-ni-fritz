"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Card, CardContent } from "./ui/card";
import { getSession } from "next-auth/react";
type Book = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string | string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
  TotalCopies?: number; // Ensure this is part of the fetched data
};

const BookListReserve = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      console.log(sessionData);
    };
    fetchSession();
  }, []);

  const userId = session?.user?.id;
  useEffect(() => {
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
      const _data = {user_id: userId, book_id: bookId};
      const formData = new FormData();
      formData.append('operation', 'reserveBook');
      formData.append('json', JSON.stringify(_data));

      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        method: "post",
        data: formData,
      })
      
        // { headers: { "Content-Type": "application/json" } }
      // alert("Book reserved successfully");
      console.log(response.data);
      // alert(response.data);
    } catch (error) {
      alert(error);
      console.error("Error reserving book:", error);
    }
  };

  // Example usage:

  return (
    <div className="container mx-auto p-4">
      <div className="grid p-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <AlertDialog key={book.BookID}>
            <AlertDialogTrigger>
              <Card className="p-3">
                <CardContent>
                  <p>{book.AuthorName}</p>
                  <p>{book.Title}</p>
                  <p>Available Copies: {book.TotalCopies ?? 0}</p>{" "}
                  {/* Display availability here */}
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent className="p-2">
              <p>{book.AuthorName}</p>
              <p>{book.Title}</p>
              <p>{book.Genres}</p>
              <p>{book.ISBN}</p>
              <p>{book.ProviderName}</p>
              <p>{book.PublicationDate}</p>
              <p>{book.TotalCopies ?? 0} available</p>{" "}
              {/* Show available copies in the dialog */}
              <button onClick={() => reserveBook(session.user.id, book.BookID)}>
                RESERVE
              </button>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
};

export default BookListReserve;
