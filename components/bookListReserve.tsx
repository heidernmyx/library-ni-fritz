"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Book, Calendar, Hash, User, Search , Bookmark} from "lucide-react";
import { getSession } from "next-auth/react";
import Image from "next/image";

type BookType = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string | string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
  AvailableCopies: number;
  Description: string;
};

export default function BookListReserve() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [session, setSession] = useState<any>(null);
  const [userReservations, setUserReservations] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingReserve, setLoadingReserve] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<string | null>(null); // State for sorting
  const { toast } = useToast();

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      if (sessionData?.user?.id) {
        fetchUserReservations(sessionData.user.id);
      }
    };
    fetchSession();
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("operation", "fetchBooks");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.data.success) {
        setBooks(response.data.books);
        
      } else {
        throw new Error(response.data.message || "Failed to fetch books.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch books.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async (userId: any) => {
    try {
      const _data = { user_id: userId };
      const formData = new FormData();
      formData.append("operation", "fetchReservedBooks");
      formData.append("json", JSON.stringify(_data));
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );
      if (response.data.success) {
        const reservedBooks = response.data.reserved_books.map(
          (reservation: any) => reservation.BookID
        );
        setUserReservations(reservedBooks);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch reserved books.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error fetching reserved books.",
        variant: "destructive",
      });
    }
  };
  

  const reserveBook = async (userId: any, bookId: any) => {
    try {
      setLoadingReserve(true);
      const _data = { user_id: userId, book_id: bookId };
      const formData = new FormData();
      formData.append("operation", "reserveBook");
      formData.append("json", JSON.stringify(_data));

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Book reserved successfully.",
        });
        fetchUserReservations(userId);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to reserve book.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while reserving the book.",
        variant: "destructive",
      });
    } finally {
      setLoadingReserve(false);
    }
  };

  // Function to sort books based on the selected option
  const sortBooks = (books: BookType[]) => {
    if (!sortOption) return books;

    const sortedBooks = [...books];

    switch (sortOption) {
      case "title":
        return sortedBooks.sort((a, b) => a.Title.localeCompare(b.Title));
      case "author":
        return sortedBooks.sort((a, b) => a.AuthorName.localeCompare(b.AuthorName));
      case "year":
        return sortedBooks.sort((a, b) =>
          new Date(a.PublicationDate).getFullYear() - new Date(b.PublicationDate).getFullYear()
        );
      default:
        return books;
    }
  };

  const filteredAndSortedBooks = sortBooks(
    books.filter(
      (book) =>
        book.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Helper function to render genres with separators
  const renderGenres = (genres: string | string[]) => {
    const genresArray = Array.isArray(genres)
      ? genres
      : genres
          .split(",")
          .map((genre) => genre.trim())
          .filter((genre) => genre.length > 0); // Remove any empty strings

    return genresArray.map((genre, index) => (
      <React.Fragment key={genre + index}>
        <Badge variant="default" >{genre}</Badge>
        {/* Add a comma separator except after the last genre */}
        {index < genresArray.length - 1 && <span aria-hidden="true"></span>}
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col justify-center bg-white mt-4 items-center flex-1 mx-auto p-8 max-h-[83vh] translate-y-[-10%]  w-[90vw] max-w-7xl pl-[4vw] bg-background rounded-2xl border-black solid">
      <h1 className="text-left text-5xl font-extrabold p-4">Libray Ni Fritz</h1>
      <div className="flex justify-between items-center mb-6 w-full gap-1">
        <div className="w-full flex items-center justify-center gap-1">
        <Search/>
            <Input
          type="search"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        </div>
    
        <Select onValueChange={(value) => setSortOption(value)} >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

       <ScrollArea className="h-[calc(90vh-150px)] w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedBooks.map((book) => (
            <Card key={book.BookID} className="flex flex-col justify-between h-full  shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-primary/10 ">
                <CardTitle className="text-lg font-bold line-clamp-2">{book.Title}</CardTitle>
                <CardDescription className="text-sm font-medium">{book.AuthorName}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap">{renderGenres(book.Genres)}</div>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" /> {book.PublicationDate}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4">
                <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Book className="mr-2 h-4 w-4" /> View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <ScrollArea className="max-h-[calc(90vh-2rem)]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold">{book.Title}</DialogTitle>
            <DialogDescription className="text-lg">{book.AuthorName}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="aspect-[3/4] relative overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/assets/gif/dragon.gif"
                  alt={book.Title || "Book cover"}
                  layout="fill"
                  objectFit="cover"
                  className="transition-all duration-300 hover:scale-105"
                />
              </div>
              <div className="flex flex-wrap gap-1">
              Genres:
                {renderGenres(book.Genres)}
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-4 text-sm">
                <Hash className="text-muted-foreground" />
                <p><span className="font-semibold">ISBN:</span> {book.ISBN}</p>
                <User className="text-muted-foreground" />
                <p><span className="font-semibold">Publisher:</span> {book.ProviderName || "Unknown"}</p>
                <Calendar className="text-muted-foreground" />
                <p><span className="font-semibold">Publication Date:</span> {book.PublicationDate}</p>
                <Bookmark className="text-muted-foreground" />
                <p><span className="font-semibold">Available Copies:</span> {book.AvailableCopies}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-lg">Description</h4>
                <p className="text-muted-foreground">{book.Description || "No description available."}</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              onClick={() => reserveBook(session?.user?.id, book.BookID)}
              disabled={
                !session?.user?.id ||
                book.AvailableCopies === 0 ||
                userReservations.includes(book.BookID) ||
                loadingReserve
              }
              className="w-full"
            >
              {loadingReserve
                ? "Reserving..."
                : userReservations.includes(book.BookID)
                ? "Already Reserved"
                : book.AvailableCopies === 0
                ? "Not Available"
                : "Reserve"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
