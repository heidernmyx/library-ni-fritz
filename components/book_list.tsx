"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useToast } from "@/hooks/use-toast";
import {
  Book,
  Edit,
  PlusCircle,
  X,
  User,
  Calendar,
  Bookmark,
  Building,
  Copy,
  Search,
} from "lucide-react";
type BookType = {
  BookID: number;
  Title: string;
  AuthorName: string;
  Genres: string | string[];
  ISBN: string;
  ProviderName: string | null;
  PublicationDate: string;
  TotalCopies?: number;
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

type Genre = {
  GenreId: number;
  GenreName: string;
};

export default function BookLibrary() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [bookProviders, setBookProviders] = useState<BookProvider[]>([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genres: [] as string[],
    isbn: "",
    publicationDate: "",
    providerId: "",
    copies: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [updateSelectedGenres, setUpdateSelectedGenres] = useState<string[]>(
    []
  );
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch functions and useEffect
  useEffect(() => {
    fetchGenres();
    fetchBookProviders();
    fetchBooks();
  }, []);

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

  const fetchGenres = async () => {
    try {
      const formData = new FormData();
      formData.append("operation", "fetchGenres");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setGenres(response.data.genres);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch genres.",
        variant: "destructive",
      });
    }
  };

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("operation", "fetchBooks");
      // No additional JSON data is required for fetching books
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
        description: error.message || "Failed to fetch books.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a book
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

  // Handle updating a book
  const handleUpdateBook = async () => {
    if (!selectedBook) return;

    setIsLoading(true);
    try {
      const payload = {
        operation: "updateBook",
        json: JSON.stringify({
          book_id: selectedBook.BookID,
          title: selectedBook.Title,
          author: selectedBook.AuthorName,
          genres: updateSelectedGenres,
          isbn: selectedBook.ISBN,
          publication_date: selectedBook.PublicationDate,
          provider_id: bookProviders.find(
            (p) => p.ProviderName === selectedBook.ProviderName
          )?.ProviderID,
          copies: selectedBook.TotalCopies,
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
        setUpdateSelectedGenres([]);
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

  // Genre selection handlers
  const handleGenreSelect = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleGenreRemove = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const handleUpdateGenreSelect = (genre: string) => {
    if (!updateSelectedGenres.includes(genre)) {
      setUpdateSelectedGenres([...updateSelectedGenres, genre]);
    }
  };

  const handleUpdateGenreRemove = (genre: string) => {
    setUpdateSelectedGenres(updateSelectedGenres.filter((g) => g !== genre));
  };

  // Format genres for display
  const formatGenres = (genres: string | string[]): string => {
    if (Array.isArray(genres)) {
      return genres.join(", ");
    } else if (typeof genres === "string") {
      return genres;
    }
    return "";
  };

  // Filtered books based on search term
  const filteredBooks = books.filter((book) =>
    book.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-primary mb-4 md:mb-0">
          Book Library
        </h1>
        <div className="flex items-center space-x-2">
          <Input
            className="w-64"
            placeholder="Search book..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" className="ml-4">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Book
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Book</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the details of the new book below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              {/* Form fields for adding new book */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newBook.title}
                  onChange={(e) =>
                    setNewBook({ ...newBook, title: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newBook.author}
                  onChange={(e) =>
                    setNewBook({ ...newBook, author: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Genres</Label>
                <Select onValueChange={handleGenreSelect} value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select genres" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.GenreId} value={genre.GenreName}>
                        {genre.GenreName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedGenres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => handleGenreRemove(genre)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={newBook.isbn}
                  onChange={(e) =>
                    setNewBook({ ...newBook, isbn: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="publicationDate">Publication Date</Label>
                <Input
                  id="publicationDate"
                  type="date"
                  value={newBook.publicationDate}
                  onChange={(e) =>
                    setNewBook({ ...newBook, publicationDate: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Book Provider</Label>
                <Select
                  onValueChange={(value) =>
                    setNewBook({ ...newBook, providerId: value })
                  }
                  value={newBook.providerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookProviders.map((provider) => (
                      <SelectItem
                        key={provider.ProviderID}
                        value={provider.ProviderID.toString()}
                      >
                        {provider.ProviderName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="copies">Copies</Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={newBook.copies}
                  onChange={(e) =>
                    setNewBook({ ...newBook, copies: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddBook} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Book"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[70vh]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card
                key={book.BookID}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardHeader className="bg-primary/10 p-6">
                  <CardTitle className="text-2xl font-bold line-clamp-2">
                    {book.Title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{book.AuthorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bookmark className="h-5 w-5 text-primary" />
                      <span>{formatGenres(book.Genres)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Book className="h-5 w-5 text-primary" />
                      <span>{book.ISBN}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{book.PublicationDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-primary" />
                      <span>{book.ProviderName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Copy className="h-5 w-5 text-primary" />
                      <span>{book.TotalCopies || "N/A"} Copies</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedBook(book);
                      setUpdateSelectedGenres(
                        Array.isArray(book.Genres)
                          ? book.Genres
                          : book.Genres.split(", ")
                      );
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" /> Update
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Update Book Dialog */}
      {selectedBook && (
        <AlertDialog
          open={!!selectedBook}
          onOpenChange={() => setSelectedBook(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Book</AlertDialogTitle>
              <AlertDialogDescription>
                Update the details of the book below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              {/* Form fields for updating book */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="updateTitle">Title</Label>
                <Input
                  id="updateTitle"
                  value={selectedBook?.Title || ""}
                  onChange={(e) =>
                    setSelectedBook((prev) =>
                      prev ? { ...prev, Title: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="updateAuthor">Author</Label>
                <Input
                  id="updateAuthor"
                  value={selectedBook?.AuthorName || ""}
                  onChange={(e) =>
                    setSelectedBook((prev) =>
                      prev ? { ...prev, AuthorName: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Genres</Label>
                <Select onValueChange={handleUpdateGenreSelect} value="">
                  <SelectTrigger>
                    <SelectValue placeholder="Select genres" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.GenreId} value={genre.GenreName}>
                        {genre.GenreName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {updateSelectedGenres.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0"
                        onClick={() => handleUpdateGenreRemove(genre)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="updateIsbn">ISBN</Label>
                <Input
                  id="updateIsbn"
                  value={selectedBook?.ISBN || ""}
                  onChange={(e) =>
                    setSelectedBook((prev) =>
                      prev ? { ...prev, ISBN: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="updatePublicationDate">Publication Date</Label>
                <Input
                  id="updatePublicationDate"
                  type="date"
                  value={selectedBook?.PublicationDate || ""}
                  onChange={(e) =>
                    setSelectedBook((prev) =>
                      prev ? { ...prev, PublicationDate: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Book Provider</Label>
                <Select
                  onValueChange={(value) => {
                    const provider = bookProviders.find(
                      (p) => p.ProviderID.toString() === value
                    );
                    setSelectedBook((prev) =>
                      prev
                        ? {
                            ...prev,
                            ProviderName: provider?.ProviderName || null,
                          }
                        : null
                    );
                  }}
                  value={
                    bookProviders
                      .find(
                        (p) => p.ProviderName === selectedBook?.ProviderName
                      )
                      ?.ProviderID.toString() || ""
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookProviders.map((provider) => (
                      <SelectItem
                        key={provider.ProviderID}
                        value={provider.ProviderID.toString()}
                      >
                        {provider.ProviderName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="updateCopies">Copies</Label>
                <Input
                  id="updateCopies"
                  type="number"
                  min="1"
                  value={selectedBook?.TotalCopies || 1}
                  onChange={(e) => {
                    const copies = parseInt(e.target.value, 10);
                    setSelectedBook((prev) =>
                      prev
                        ? {
                            ...prev,
                            TotalCopies: isNaN(copies) ? 1 : copies,
                          }
                        : null
                    );
                  }}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedBook(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUpdateBook}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Book"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
