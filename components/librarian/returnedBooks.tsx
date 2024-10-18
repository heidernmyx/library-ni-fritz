"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Import useToast

interface ReturnedBook {
  BorrowID: number;
  UserID: number;
  UserName: string;
  BookID: number;
  Title: string;
  AuthorName: string;
  BorrowDate: string;
  DueDate: string;
  ReturnDate: string;
  PenaltyFees: number;
  BorrowStatusID: number;
  BorrowStatusName: string;
}

export default function ReturnedBooks() {
  const [returnedBooks, setReturnedBooks] = useState<ReturnedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Use the toast hook

  useEffect(() => {
    fetchReturnedBooks();
  }, []);

  const fetchReturnedBooks = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("operation", "fetchReturnedBooks");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        setReturnedBooks(response.data.returned_books);
      } else {
        setError("Failed to fetch returned books.");
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async (borrowId: number) => {
    try {
      const formData = new FormData();
      formData.append("operation", "confirmReturn");
      formData.append(
        "json",
        JSON.stringify({
          borrow_id: borrowId,
        })
      );

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        // Show a success toast
        toast({
          title: "Return Confirmed",
          description:
            "The book has been marked as returned and is now available.",
        });
        // Refresh the returned books list
        fetchReturnedBooks();
      } else {
        // Show an error toast
        toast({
          title: "Failed to Confirm Return",
          description: response.data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error confirming return:", err);
      // Show an error toast
      toast({
        title: "Error",
        description: "An error occurred while confirming the return.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
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
    <div className="space-y-6 w-[90%] mr-8   mx-auto shadow-xl">
      <Card className="min-h-[90vh]">
        <CardHeader>
          <CardTitle className="text-2xl">
            Returned Books Pending Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {returnedBooks.length > 0 ? (
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Borrowed By</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Penalty Fees</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {returnedBooks.map((book) => (
                    <TableRow key={book.BorrowID}>
                      <TableCell className="font-medium">
                        {book.Title}
                      </TableCell>
                      <TableCell>{book.AuthorName}</TableCell>
                      <TableCell>{book.UserName}</TableCell>
                      <TableCell>{book.ReturnDate}</TableCell>
                      <TableCell>
                        {book.PenaltyFees > 0 ? (
                          <Badge variant="destructive">
                            ₱{book.PenaltyFees}
                          </Badge>
                        ) : (
                          <Badge variant="success">No Penalty</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleConfirmReturn(book.BorrowID)}
                          variant="success"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Returned Books</AlertTitle>
              <AlertDescription>
                There are no returned books pending confirmation at the moment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
