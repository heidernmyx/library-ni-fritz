"use client"

import React, { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { AlertCircle, Book, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"

interface ReservedBook {
  ReservationID: number
  BookID: number
  Title: string
  Fname: string
  AuthorName: string
  ReservationDate: string
  ExpirationDate: string
  StatusName: string
  ReservationStatus: string
  ISBN: string
}

interface ReservationStatus {
  StatusID: number
  StatusName: string
}

export default function AdminReservedBooks() {
  const [reservedBooks, setReservedBooks] = useState<ReservedBook[]>([])
  const [statuses, setStatuses] = useState<ReservationStatus[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("title")
  const { toast } = useToast()

  useEffect(() => {
    const fetchReservedBooks = async () => {
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append("operation", "fetchReservedBooks")

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          formData
        )

        if (response.data.success) {
          setReservedBooks(response.data.reserved_books)
        } else {
          setError("Failed to fetch reserved books.")
        }
      } catch (err: any) {
        setError(
          err.response ? err.response.data.message : "An error occurred."
        )
      } finally {
        setLoading(false)
      }
    }

    const fetchStatuses = async () => {
      try {
        const formData = new FormData()
        formData.append("operation", "fetchStatus")

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )

        if (response.data.success) {
          setStatuses(response.data.statuses)
        } else {
          throw new Error(response.data.message || "Failed to fetch statuses.")
        }
      } catch (error: any) {
        console.error("Fetch Status Error:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to fetch statuses.",
          variant: "destructive",
        })
      }
    }

    fetchReservedBooks()
    fetchStatuses()
  }, [])

  const handleStatusChange = async (
    reservationId: number,
    newStatusId: number
  ) => {
    try {
      const formData = new FormData()
      formData.append("operation", "updateReservationStatus")
      formData.append(
        "json",
        JSON.stringify({
          reservation_id: reservationId,
          status_id: newStatusId,
        })
      )

      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        method: "post",
        data: formData,
      })

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
        )

        toast({
          title: "Status Updated",
          description: "Reservation status has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description:
            response.data.message || "Failed to update reservation status.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response
          ? err.response.data.message
          : "An error occurred while updating the status.",
        variant: "destructive",
      })
    }
  }

  const filteredAndSortedBooks = useMemo(() => {
    return reservedBooks
      .filter((book) => {
        const matchesSearch =
          book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.Fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus =
          statusFilter === "all" || book.ReservationStatus === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "title":
            return a.Title.localeCompare(b.Title)
          case "user":
            return a.Fname.localeCompare(b.Fname)
          case "reservationDate":
            return new Date(a.ReservationDate).getTime() - new Date(b.ReservationDate).getTime()
          case "expirationDate":
            return new Date(a.ExpirationDate).getTime() - new Date(b.ExpirationDate).getTime()
          default:
            return 0
        }
      })
  }, [reservedBooks, searchTerm, statusFilter, sortOption])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 w-[90%] mr-8 mx-auto shadow-xl">
      <Card className="min-h-[90vh]">
        <CardHeader>
          <CardTitle className="text-2xl">Reserved Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by title, user, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select onValueChange={setStatusFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.StatusID} value={status.StatusName}>
                    {status.StatusName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSortOption} defaultValue="title">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="reservationDate">Reservation Date</SelectItem>
                <SelectItem value="expirationDate">Expiration Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredAndSortedBooks.length > 0 ? (
            <ScrollArea className="h-[calc(90vh-200px)]">
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
                  {filteredAndSortedBooks.map((book) => (
                    <TableRow key={book.ReservationID}>
                      <TableCell>{book.Title}</TableCell>
                      <TableCell>{book.Fname}</TableCell>
                      <TableCell>{book.ReservationDate}</TableCell>
                      <TableCell>{book.ExpirationDate}</TableCell>
                      <TableCell>
                        <Badge>{book.ReservationStatus}</Badge>
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
                There are no reserved books matching your search criteria.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}