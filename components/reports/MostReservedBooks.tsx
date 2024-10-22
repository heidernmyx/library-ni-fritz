"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen } from "lucide-react";

interface ReservedBook {
  BookID: number;
  Title: string;
  AuthorName: string;
  ReservationCount: number;
}

export default function MostReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMostReservedBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports.php?operation=fetchMostReservedBooks`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setReservedBooks(response.data.most_reserved_books);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching most reserved books:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMostReservedBooks();
  }, []);

  return (
    <Card className="w-full  mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Most Reserved Books</CardTitle>
        <CardDescription>
          Books with the highest number of reservations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : reservedBooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="text-right">Reservations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservedBooks.map((book) => (
                <TableRow key={book.BookID}>
                  <TableCell className="font-medium">{book.Title}</TableCell>
                  <TableCell>{book.AuthorName}</TableCell>
                  <TableCell className="text-right">
                    {book.ReservationCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-semibold">No Reserved Books</p>
            <p className="text-sm text-muted-foreground">
              There are currently no book reservations.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
