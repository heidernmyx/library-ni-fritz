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
import { AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OverdueBook {
  BorrowID: number;
  Title: string;
  UserName: string;
  DaysOverdue: number;
}

export default function OverdueBooks() {
  const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverdueBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports.php?operation=fetchOverdueBooks`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setOverdueBooks(response.data.overdue_books);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching overdue books:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverdueBooks();
  }, []);

  const getOverdueSeverity = (days: number) => {
    if (days <= 7) return "low";
    if (days <= 14) return "medium";
    return "high";
  };

  return (
    <Card className="w-full  mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Overdue Books</CardTitle>
        <CardDescription>
          Books that are currently past their due date
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
        ) : overdueBooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueBooks.map((book) => (
                <TableRow key={book.BorrowID}>
                  <TableCell className="font-medium">{book.Title}</TableCell>
                  <TableCell>{book.UserName}</TableCell>
                  <TableCell>{book.DaysOverdue}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getOverdueSeverity(book.DaysOverdue) === "high"
                          ? "destructive"
                          : "outline"
                      }
                      className={
                        getOverdueSeverity(book.DaysOverdue) === "medium"
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          : ""
                      }
                    >
                      {getOverdueSeverity(book.DaysOverdue)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-semibold">No Overdue Books</p>
            <p className="text-sm text-muted-foreground">
              All books are currently returned on time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
