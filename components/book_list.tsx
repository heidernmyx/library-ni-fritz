"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Book, Edit, PlusCircle } from "lucide-react";

type Book = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
};

type BookProvider = {
  ProviderID: number;
  ProviderName: string;
  Phone: string;
  Email: string;
  PostalCode: string;
  City: string;
  Country: string;
  State: string;
  Street: string;
};

export default function BookLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [bookProviders, setBookProviders] = useState<BookProvider[]>([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genres: "",
    isbn: "",
    publicationDate: "",
    providerId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();

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

  const fetchBooks = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        { operation: "fetchBooks" },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setBooks(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch books.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBookProviders();
    fetchBooks();
  }, []);

  const handleAddBook = async () => {
    setIsLoading(true);
    try {
      const payload = {
        operation: "addBook",
        json: JSON.stringify({
          title: newBook.title,
          author: newBook.author,
          genres: newBook.genres.split(",").map((genre) => genre.trim()),
          isbn: newBook.isbn,
          publication_date: newBook.publicationDate,
          provider_id: newBook.providerId,
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
          genres: "",
          isbn: "",
          publicationDate: "",
          providerId: "",
        });
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

  const handleUpdateBook = async () => {
    if (!selectedBook) return;

    setIsLoading(true);
    try {
      const payload = {
        operation: "updateBook",
        json: JSON.stringify({
          id: selectedBook.BookID,
          title: selectedBook.Title,
          author: selectedBook.AuthorName,
          genres: selectedBook.Genres,
          isbn: selectedBook.ISBN,
          publication_date: selectedBook.PublicationDate,
          provider_id: bookProviders.find(
            (p) => p.ProviderName === selectedBook.ProviderName
          )?.ProviderID,
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
        setSelectedBook(null);
        toast({
          title: "Success",
          description: "Book updated successfully",
        });
      } else {
        throw new Error(data.message || "Failed to update book");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : "An error occurred while updating the book",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-stone-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-stone-800">
        Book Library
      </h1>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="mb-8 bg-emerald-600 hover:bg-emerald-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-stone-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Book</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the details of the new book below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newBook.title}
                onChange={(e) =>
                  setNewBook({ ...newBook, title: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="author" className="text-right">
                Author
              </Label>
              <Input
                id="author"
                value={newBook.author}
                onChange={(e) =>
                  setNewBook({ ...newBook, author: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genres" className="text-right">
                Genres
              </Label>
              <Input
                id="genres"
                value={newBook.genres}
                onChange={(e) =>
                  setNewBook({ ...newBook, genres: e.target.value })
                }
                className="col-span-3"
                placeholder="Separate genres with commas"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isbn" className="text-right">
                ISBN
              </Label>
              <Input
                id="isbn"
                value={newBook.isbn}
                onChange={(e) =>
                  setNewBook({ ...newBook, isbn: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publicationDate" className="text-right">
                Publication Date
              </Label>
              <Input
                id="publicationDate"
                type="date"
                value={newBook.publicationDate}
                onChange={(e) =>
                  setNewBook({ ...newBook, publicationDate: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider" className="text-right">
                Book Provider
              </Label>
              <select
                title="provider"
                id="provider"
                value={newBook.providerId}
                onChange={(e) =>
                  setNewBook({ ...newBook, providerId: e.target.value })
                }
                className="col-span-3 border rounded p-2"
              >
                <option value="">Select a Provider</option>
                {bookProviders.map((provider) => (
                  <option key={provider.ProviderID} value={provider.ProviderID}>
                    {provider.ProviderName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-stone-200 hover:bg-stone-300">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild disabled={isLoading}>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleAddBook}
              >
                {isLoading ? "Adding..." : "Add Book"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-4">
        {books.map((book) => (
          <Card key={book.BookID}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-4 w-4" /> {book.Title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Author:</strong> {book.AuthorName}
              </p>
              <p>
                <strong>Genres:</strong> {book.Genres}
              </p>
              <p>
                <strong>ISBN:</strong> {book.ISBN}
              </p>
              <p>
                <strong>Provider:</strong> {book.ProviderName || "N/A"}
              </p>
              <p>
                <strong>Publication Date:</strong> {book.PublicationDate}
              </p>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedBook(book)}
                className="bg-yellow-400 hover:bg-yellow-500 text-white"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
