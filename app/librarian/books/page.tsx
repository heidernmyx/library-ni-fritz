'use client'
import React, { useEffect, useState } from 'react'
import Image from "next/image"
import Link from "next/link"
import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  ShoppingCart,
  Users2,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import axios from 'axios';
import { fetchBooks } from '@/lib/actions/book';
import fetchGenres from '@/lib/actions/genre';
import { Book, BookFormField, BookProvider } from '@/lib/types/book-types';
import { Genre } from '@/lib/types/genre-types';
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
  const [updateSelectedGenres, setUpdateSelectedGenres] = useState<string[]>([]);
  const [bookProviders, setBookProviders] = useState<BookProvider[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const _genres = await fetchGenres();
      const _books = await fetchBooks();
      setGenres(_genres);
      setBooks(_books);
      
    };
    alert("fetching data")
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
      <Button>add book</Button>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="draft">Draft</TabsTrigger>
                <TabsTrigger value="archived" className="hidden sm:flex">
                  Archived
                </TabsTrigger>
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
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    {/* <Button className="mb-8 bg-primary hover:bg-primary/90 hover:translate-x-[2px] hover:translate-y-[2px] transition-all delay-150 transform hover:scale-110">
                      <PlusCircle className=" h-4 w-4" />
                    </Button> */}
                    <Button size="sm" className="h-8 gap-1">
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Add Product
                      </span>
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
            </div>
            <TabsContent value="all">
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your products and view their sales performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden w-[100px] sm:table-cell">
                          <span className="sr-only">Image</span>
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Total Sales
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Created at
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="hidden sm:table-cell">
                          <Image
                            alt="Product image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src="/placeholder.svg"
                            width="64"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          Laser Lemonade Machine
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Draft</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          $499.99
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          25
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2023-07-12 10:42 AM
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                      
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-10</strong> of <strong>32</strong>{" "}
                    products
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

    </div>
  )
}

export default Books