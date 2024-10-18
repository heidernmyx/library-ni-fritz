"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  ShoppingCart,
  Users2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { fetchBooks } from "@/lib/actions/book";
import fetchGenres from "@/lib/actions/genre";
import { Book, BookFormField, BookProvider } from "@/lib/types/book-types";
import { Genre } from "@/lib/types/genre-types";
import BookLibrary from "@/components/book_list";
import BookListReserve from "@/components/bookListReserve";
import AdminReservedBooks from "@/components/librarian/reservedBooks";
const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [newBook, setNewBook] = useState<BookFormField>({
    title: "",
    author: "",
    genres: [],
    isbn: "",
    publicationDate: "",
    providerId: "",
    copies: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [updateSelectedGenres, setUpdateSelectedGenres] = useState<string[]>(
    []
  );
  const [bookProviders, setBookProviders] = useState<BookProvider[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const _genres = await fetchGenres();
      const _books = await fetchBooks();
      setGenres(_genres);
      setBooks(_books);
    };
    // alert("fetching data")
    fetchData();
  }, []);

  const handleGenreSelect = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleGenreRemove = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const handleAddBook = async () => {
    setIsLoading(true);
    try {
      const payload = {
        operation: "addBook",
        json: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          genres: selectedGenres,
          isbn: newBook.isbn,
          publication_date: newBook.publicationDate,
          provider_id: newBook.providerId,
          copies: newBook.copies,
        }),
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        payload,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      const data = response.data;

      if (data.success) {
        fetchBooks();
        setNewBook({
          title: "",
          author: "",
          genres: [],
          isbn: "",
          publicationDate: "",
          providerId: "",
          copies: 1,
        });
        setSelectedGenres([]);
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      } else {
        throw new Error(data.message || "Failed to add book");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "An error occurred while adding the book",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookProviders = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bookprovider.php`,
        { operation: "fetchBookProviders" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setBookProviders(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch book providers.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 mx-auto p-4 min-h-screen w-[90vw] max-w-7xl pl-[4vw]">
      {/* <Button>add book</Button> */}
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs defaultValue="all">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="reserved">Resereved</TabsTrigger>
              {/* <TabsTrigger value="draft">Draft</TabsTrigger>
              <TabsTrigger value="archived" className="hidden sm:flex">
                Archived
              </TabsTrigger> */}
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem>Reserved</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Borrowed</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Due</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <TabsContent value="all">
            <BookLibrary />
          </TabsContent>
          <TabsContent value="reserved">
            <AdminReservedBooks />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Books;
