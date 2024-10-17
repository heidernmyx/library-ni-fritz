"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Book } from "lucide-react";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface BorrowedBook {
  BorrowID: number;
  BookID: number;
  Title: string;
  Name: string;
  AuthorName: string;
  BorrowDate: string;
  DueDate: string;
  StatusName: string;
  ISBN: string;
  PenaltyFees: number;
  BorrowStatus: string;
}

export default function AdminBorrowedBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Use the toast hook

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

  const handleDueDateChange = async (borrowId: number, newDueDate: string) => {
    try {
      const formData = new FormData();
      formData.append("operation", "updateDueDate");
      formData.append(
        "json",
        JSON.stringify({
          borrow_id: borrowId,
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
            book.BorrowID === borrowId ? { ...book, DueDate: newDueDate } : book
          )
        );

        // Show a success toast
        toast({
          title: "Due Date Updated",
          description: "The due date has been updated successfully.",
        });
      } else {
        // Show an error toast
        toast({
          title: "Error",
          description: response.data.message || "Failed to update due date.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Show an error toast
      toast({
        title: "Error",
        description: err.response
          ? err.response.data.message
          : "An error occurred while updating the due date.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          {borrowedBooks.length > 0 ? (
            <ScrollArea>
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
                    <TableRow key={book.BorrowID}>
                      <TableCell>{book.Title}</TableCell>
                      <TableCell>{book.Name}</TableCell>
                      <TableCell>{book.BorrowDate}</TableCell>
                      <TableCell>
                        {book.DueDate
                          ? format(new Date(book.DueDate), "yyyy-MM-dd")
                          : "No Due Date"}
                      </TableCell>
                      <TableCell>
                        <Badge>{book.BorrowStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        <DueDatePicker
                          borrowId={book.BorrowID}
                          currentDueDate={book.DueDate}
                          onDueDateChange={handleDueDateChange}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>No Borrowed Books</AlertTitle>
              <AlertDescription>
                There are no borrowed books at the moment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface DueDatePickerProps {
  borrowId: number;
  currentDueDate: string;
  onDueDateChange: (borrowId: number, newDueDate: string) => void;
}

function DueDatePicker({
  borrowId,
  currentDueDate,
  onDueDateChange,
}: DueDatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    currentDueDate ? new Date(currentDueDate) : undefined
  );
  const [open, setOpen] = useState<boolean>(false);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onDueDateChange(borrowId, format(selectedDate, "yyyy-MM-dd"));
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {date ? format(date, "yyyy-MM-dd") : "Set Due Date"}
          <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={handleDateChange} />
      </PopoverContent>
    </Popover>
  );
}
