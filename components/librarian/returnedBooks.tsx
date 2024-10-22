"use client"

import React, { useEffect, useState, useMemo } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReturnedBook {
  BorrowID: number
  UserID: number
  UserName: string
  BookID: number
  Title: string
  AuthorName: string
  BorrowDate: string
  DueDate: string
  ReturnDate: string
  PenaltyFees: number
  BorrowStatusID: number
  BorrowStatusName: string
}

export default function ReturnedBooks() {
  const [returnedBooks, setReturnedBooks] = useState<ReturnedBook[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [penaltyFilter, setPenaltyFilter] = useState<string>("all")
  const [sortOption, setSortOption] = useState<string>("title")
  const { toast } = useToast()

  useEffect(() => {
    fetchReturnedBooks()
  }, [])

  const fetchReturnedBooks = async () => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("operation", "fetchReturnedBooks")

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      )

      if (response.data.success) {
        setReturnedBooks(response.data.returned_books)
      } else {
        setError("Failed to fetch returned books.")
      }
    } catch (err: any) {
      setError(err.response ? err.response.data.message : "An error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReturn = async (borrowId: number) => {
    try {
      const formData = new FormData()
      formData.append("operation", "confirmReturn")
      formData.append(
        "json",
        JSON.stringify({
          borrow_id: borrowId,
        })
      )

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      )

      if (response.data.success) {
        toast({
          title: "Return Confirmed",
          description:
            "The book has been marked as returned and is now available.",
        })
        fetchReturnedBooks()
      } else {
        toast({
          title: "Failed to Confirm Return",
          description: response.data.message || "An error occurred.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error confirming return:", err)
      toast({
        title: "Error",
        description: "An error occurred while confirming the return.",
        variant: "destructive",
      })
    }
  }

  const filteredAndSortedBooks = useMemo(() => {
    return returnedBooks
      .filter((book) => {
        const matchesSearch =
          book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesPenalty =
          penaltyFilter === "all" ||
          (penaltyFilter === "withPenalty" && book.PenaltyFees > 0) ||
          (penaltyFilter === "noPenalty" && book.PenaltyFees === 0)
        return matchesSearch && matchesPenalty
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "title":
            return a.Title.localeCompare(b.Title)
          case "user":
            return a.UserName.localeCompare(b.UserName)
          case "returnDate":
            return new Date(a.ReturnDate).getTime() - new Date(b.ReturnDate).getTime()
          case "penaltyFees":
            return a.PenaltyFees - b.PenaltyFees
          default:
            return 0
        }
      })
  }, [returnedBooks, searchTerm, penaltyFilter, sortOption])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[250px]" />
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
          <CardTitle className="text-2xl">
            Returned Books Pending Confirmation
          </CardTitle>
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
            <Select onValueChange={setPenaltyFilter} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by penalty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="withPenalty">With Penalty</SelectItem>
                <SelectItem value="noPenalty">No Penalty</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setSortOption} defaultValue="title">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="returnDate">Return Date</SelectItem>
                <SelectItem value="penaltyFees">Penalty Fees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {filteredAndSortedBooks.length > 0 ? (
            <ScrollArea className="h-[calc(90vh-200px)]">
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
                  {filteredAndSortedBooks.map((book) => (
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
            <p>wala dara</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}