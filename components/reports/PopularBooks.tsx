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
import { AlertCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Book {
  BookID: number;
  Title: string;
  AuthorName: string;
  BorrowCount: number;
}

export default function PopularBooks() {
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports.php?operation=fetchPopularBooks`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setPopularBooks(response.data.popular_books);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching popular books:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

  const getPopularityBadge = (borrowCount: number) => {
    if (borrowCount >= 50) return "hot";
    if (borrowCount >= 30) return "trending";
    return "popular";
  };

  return (
    <Card className="w-full  mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Popular Books</CardTitle>
        <CardDescription>
          Most frequently borrowed books in our library
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
        ) : popularBooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Borrow Count</TableHead>
                <TableHead>Popularity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {popularBooks.map((book) => (
                <TableRow key={book.BookID}>
                  <TableCell className="font-medium">{book.Title}</TableCell>
                  <TableCell>{book.AuthorName}</TableCell>
                  <TableCell>{book.BorrowCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getPopularityBadge(book.BorrowCount) === "hot"
                          ? "destructive"
                          : "outline"
                      }
                      className={
                        getPopularityBadge(book.BorrowCount) === "trending"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : ""
                      }
                    >
                      {getPopularityBadge(book.BorrowCount)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-semibold">No Popular Books</p>
            <p className="text-sm text-muted-foreground">
              There are currently no popular books to display.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
