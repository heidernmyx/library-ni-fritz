"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Book, Calendar, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface BorrowedBook {
  ReservationID: number;
  BookID: number;
  Title: string;
  Name: string;
  AuthorName: string;
  BorrowDate: string;
  ReservationDate: string;
  DueDate: string;
  StatusName: string;
  ISBN: string;
  PenaltyFees: number;
}

export default function AdminBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch borrowed books
  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("operation", "fetchBorrowedBooks");

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
        setError(
          err.response ? err.response.data.message : "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  const handleDueDateChange = async (
    reservationId: number,
    newDueDate: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("operation", "updateDueDate");
      formData.append(
        "json",
        JSON.stringify({
          reservation_id: reservationId,
          new_due_date: newDueDate,
        })
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        setBorrowedBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.ReservationID === reservationId
              ? { ...book, ExpirationDate: newDueDate }
              : book
          )
        );
      } else {
        setError("Failed to update due date.");
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Borrowed Books</h1>
      {borrowedBooks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Borrowed Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowedBooks.map((book) => (
              <TableRow key={book.ReservationID}>
                <TableCell>{book.Title}</TableCell>
                <TableCell>{book.Name}</TableCell>
                <TableCell>{book.BorrowDate}</TableCell>
                <TableCell>
                  {" "}
                  {book.DueDate ? book.DueDate : "No Due Date"}
                </TableCell>
                <TableCell>{book.StatusName}</TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      handleDueDateChange(book.ReservationID, book.DueDate)
                    }
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Alert>
          <Book className="h-4 w-4" />
          <AlertTitle>No Borrowed Books</AlertTitle>
          <AlertDescription>
            There are no borrowed books at the moment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
