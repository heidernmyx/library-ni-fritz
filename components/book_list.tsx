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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import bookListReserve from "./bookListReserve";
import BookListReserve from "./bookListReserve";

type Book = {
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
  const [books, setBooks] = useState<Book[]>([]);
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [updateSelectedGenres, setUpdateSelectedGenres] = useState<string[]>(
    []
  );
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

  const fetchGenres = async () => {
    try {
      // const formData = new FormData();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        {
          params: {
            operation: "fetchGenres",
          },
        }
      );
      // { headers: { "Content-Type": "application/x-www-form-urlencoded" } }

      setGenres(response.data);
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
    fetchGenres();
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
      console.log(payload);

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

  const formatGenres = (genres: string | string[]): string => {
    if (Array.isArray(genres)) {
      return genres.join(", ");
    } else if (typeof genres === "string") {
      return genres;
    }
    return "";
  };

  return (
    <div className="flex flex-col flex-1 mx-auto p-4 min-h-screen w-[80vw] max-w-7xl">
      <div className="flex justify-between">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-primary">
          Book Library
        </h1>
        <Input
          className="w-[17vw] text-lg"
          placeholder="Search book..."
          type="text"
        />
      </div>
      <div className="fixed bottom-3 right-8 z-50">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="mb-8 bg-primary hover:bg-primary/90 hover:translate-x-[2px] hover:translate-y-[2px] transition-all delay-150 transform hover:scale-110">
              <PlusCircle className=" h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-background">
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
                <div className="col-span-3">
                  <select
                    title="genres"
                    id="genres"
                    onChange={(e) => handleGenreSelect(e.target.value)}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Select a genre</option>
                    {genres.map((genre) => (
                      <option key={genre.GenreId} value={genre.GenreName}>
                        {genre.GenreName}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedGenres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="text-sm"
                      >
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
                  className="col-span-3 border rounded-md p-2"
                >
                  <option value="">Select a provider</option>
                  {bookProviders.map((provider) => (
                    <option
                      key={provider.ProviderID}
                      value={provider.ProviderID}
                    >
                      {provider.ProviderName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="copies" className="text-right">
                  Copies
                </Label>
                <Input
                  id="copies"
                  type="number"
                  min="1"
                  value={newBook.copies}
                  onChange={(e) =>
                    setNewBook({ ...newBook, copies: parseInt(e.target.value) })
                  }
                  className="col-span-3"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card
            key={book.BookID}
            className="bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <CardHeader className="bg-primary/10 p-6 py-28">
              <CardTitle className="text-2xl font-bold text-center line-clamp-2">
                {book.Title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <span>{book.TotalCopies || "N/A"}</span>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/50 p-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
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
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update Book</AlertDialogTitle>
                    <AlertDialogDescription>
                      Update the details of the book below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateTitle" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="updateTitle"
                        value={selectedBook?.Title || ""}
                        onChange={(e) =>
                          setSelectedBook((prev) =>
                            prev ? { ...prev, Title: e.target.value } : null
                          )
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateAuthor" className="text-right">
                        Author
                      </Label>
                      <Input
                        id="updateAuthor"
                        value={selectedBook?.AuthorName || ""}
                        onChange={(e) =>
                          setSelectedBook((prev) =>
                            prev
                              ? { ...prev, AuthorName: e.target.value }
                              : null
                          )
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateGenres" className="text-right">
                        Genres
                      </Label>
                      <div className="col-span-3">
                        <select
                          title="updateGenres"
                          id="updateGenres"
                          onChange={(e) =>
                            handleUpdateGenreSelect(e.target.value)
                          }
                          className="w-full border rounded-md p-2"
                        >
                          <option value="">Select a genre</option>
                          {genres.map((genre) => (
                            <option key={genre.GenreId} value={genre.GenreName}>
                              {genre.GenreName}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {updateSelectedGenres.map((genre) => (
                            <Badge
                              key={genre}
                              variant="secondary"
                              className="text-sm"
                            >
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
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateIsbn" className="text-right">
                        ISBN
                      </Label>
                      <Input
                        id="updateIsbn"
                        value={selectedBook?.ISBN || ""}
                        onChange={(e) =>
                          setSelectedBook((prev) =>
                            prev ? { ...prev, ISBN: e.target.value } : null
                          )
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="updatePublicationDate"
                        className="text-right"
                      >
                        Publication Date
                      </Label>
                      <Input
                        id="updatePublicationDate"
                        type="date"
                        value={selectedBook?.PublicationDate || ""}
                        onChange={(e) =>
                          setSelectedBook((prev) =>
                            prev
                              ? { ...prev, PublicationDate: e.target.value }
                              : null
                          )
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateProvider" className="text-right">
                        Book Provider
                      </Label>
                      <select
                        title="updateProvider"
                        id="updateProvider"
                        value={
                          bookProviders.find(
                            (p) => p.ProviderName === selectedBook?.ProviderName
                          )?.ProviderID || ""
                        }
                        onChange={(e) => {
                          const provider = bookProviders.find(
                            (p) => p.ProviderID.toString() === e.target.value
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
                        className="col-span-3 border rounded-md p-2"
                      >
                        <option value="">Select a provider</option>
                        {bookProviders.map((provider) => (
                          <option
                            key={provider.ProviderID}
                            value={provider.ProviderID}
                          >
                            {provider.ProviderName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="updateCopies" className="text-right">
                        Copies
                      </Label>
                      <Input
                        id="updateCopies"
                        type="text"
                        value={selectedBook ? selectedBook.TotalCopies : 1}
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
                        className="col-span-3"
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
