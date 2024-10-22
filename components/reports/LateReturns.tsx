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
import { AlertCircle, UserX } from "lucide-react";

interface LateReturner {
  UserID: number;
  UserName: string;
  LateReturns: number;
}

export default function LateReturners() {
  const [lateReturners, setLateReturners] = useState<LateReturner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLateReturners = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reports.php?operation=fetchLateReturners`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.success) {
          setLateReturners(response.data.late_returners);
        } else {
          setError("Failed to fetch data");
        }
      } catch (err) {
        console.error("Error fetching late returners:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLateReturners();
  }, []);

  return (
    <Card className="w-full h-[100% ] mx-auto shadow-xl">
      <CardHeader>
        <CardTitle>Late Returners</CardTitle>
        <CardDescription>Users with overdue book returns</CardDescription>
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
        ) : lateReturners.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead className="text-right">Late Returns</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lateReturners.map((returner) => (
                <TableRow key={returner.UserID}>
                  <TableCell>{returner.UserID}</TableCell>
                  <TableCell>{returner.UserName}</TableCell>
                  <TableCell className="text-right">
                    {returner.LateReturns}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            <UserX className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-lg font-semibold">No Late Returners</p>
            <p className="text-sm text-muted-foreground">
              All users have returned their books on time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
