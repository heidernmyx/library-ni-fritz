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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReservedBook {
  ReservationID: number;
  BookID: number;
  Title: string;
  Name: string;
  AuthorName: string;
  ReservationDate: string;
  ExpirationDate: string;
  StatusName: string;
  ISBN: string;
}

interface ReservationStatus {
  StatusID: number;
  StatusName: string;
}

export default function AdminReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([]);
  const [statuses, setStatuses] = useState<ReservationStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Use the toast hook

  // Fetch reserved books and reservation statuses
  useEffect(() => {
    const fetchReservedBooks = async () => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("operation", "fetchReservedBooks");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          formData
        );

        if (response.data.success) {
          setReservedBooks(response.data.reserved_books);
        } else {
          setError("Failed to fetch reserved books.");
        }
      } catch (err: any) {
        setError(
          err.response ? err.response.data.message : "An error occurred."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchStatuses = async () => {
      try {
        const formData = new FormData();
        formData.append("operation", "fetchStatus");

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          formData
        );

        if (response.status === 200) {
          setStatuses(response.data);
        } else {
          setError("Failed to fetch statuses.");
        }
      } catch (err: any) {
        setError("An error occurred while fetching statuses.");
        console.error("Failed to fetch reservation statuses:", err);
      }
    };

    fetchReservedBooks();
    fetchStatuses();
  }, []);

  const handleStatusChange = async (
    reservationId: number,
    newStatusId: number
  ) => {
    try {
      const formData = new FormData();
      formData.append("operation", "updateReservationStatus");
      formData.append(
        "json",
        JSON.stringify({
          reservation_id: reservationId,
          status_id: newStatusId,
        })
      );

      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        method: "post",
        data: formData,
      });

      if (response.data.success) {
        setReservedBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.ReservationID === reservationId
              ? {
                  ...book,
                  StatusName:
                    statuses.find((s) => s.StatusID === newStatusId)
                      ?.StatusName || book.StatusName,
                }
              : book
          )
        );

        // Show a success toast
        toast({
          title: "Status Updated",
          description: "Reservation status has been updated successfully.",
        });
      } else {
        // Show an error toast
        toast({
          title: "Error",
          description:
            response.data.message || "Failed to update reservation status.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      // Show an error toast
      toast({
        title: "Error",
        description: err.response
          ? err.response.data.message
          : "An error occurred while updating the status.",
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
          <CardTitle className="text-2xl">Reserved Books</CardTitle>
        </CardHeader>
        <CardContent>
          {reservedBooks.length > 0 ? (
            <ScrollArea>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Reserved Date</TableHead>
                    <TableHead>Expiration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservedBooks.map((book) => (
                    <TableRow key={book.ReservationID}>
                      <TableCell>{book.Title}</TableCell>
                      <TableCell>{book.Name}</TableCell>
                      <TableCell>{book.ReservationDate}</TableCell>
                      <TableCell>{book.ExpirationDate}</TableCell>
                      <TableCell>
                        <Badge>{book.StatusName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) =>
                            handleStatusChange(
                              book.ReservationID,
                              parseInt(value)
                            )
                          }
                          defaultValue={
                            statuses
                              .find((s) => s.StatusName === book.StatusName)
                              ?.StatusID.toString() || ""
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((status) => (
                              <SelectItem
                                key={status.StatusID}
                                value={status.StatusID.toString()}
                              >
                                {status.StatusName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <Alert>
              <Book className="h-4 w-4" />
              <AlertTitle>No Reservations</AlertTitle>
              <AlertDescription>
                There are no reserved books at the moment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
