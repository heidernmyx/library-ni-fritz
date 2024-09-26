"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PlusCircle, Heart } from "lucide-react";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  summary: string;
}

const initialBooks: Book[] = [
  {
    id: "1",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    coverImage: "/placeholder.svg?height=300&width=200",
    summary: "A classic of modern American literature.",
  },
  {
    id: "2",
    title: "1984",
    author: "George Orwell",
    coverImage: "/placeholder.svg?height=300&width=200",
    summary: "A dystopian social science fiction novel.",
  },
  {
    id: "3",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    coverImage: "/placeholder.svg?height=300&width=200",
    summary: "A novel of the Jazz Age.",
  },
];

export function BookManagementComponent() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState<Omit<Book, "id">>({
    title: "",
    author: "",
    coverImage: "",
    summary: "",
  });

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
  };

  const handleUpdateBook = () => {
    if (editingBook) {
      setBooks(
        books.map((book) => (book.id === editingBook.id ? editingBook : book))
      );
      setEditingBook(null);
    }
  };

  const handleAddBook = () => {
    const id = String(books.length + 1);
    setBooks([...books, { ...newBook, id }]);
    setNewBook({ title: "", author: "", coverImage: "", summary: "" });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Book Management</h1>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Book
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Add New Book</AlertDialogTitle>
              <AlertDialogDescription>
                Enter the details of the new book.
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
                <Label htmlFor="coverImage" className="text-right">
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  value={newBook.coverImage}
                  onChange={(e) =>
                    setNewBook({ ...newBook, coverImage: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="summary" className="text-right">
                  Summary
                </Label>
                <Input
                  id="summary"
                  value={newBook.summary}
                  onChange={(e) =>
                    setNewBook({ ...newBook, summary: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddBook}>
                Add Book
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <AlertDialog key={book.id}>
            <AlertDialogTrigger asChild>
              <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader>
                  <div className="w-full aspect-[3/4] relative mb-4">
                    <Image
                      src={
                        book.coverImage ||
                        `/placeholder.svg?height=300&width=200`
                      }
                      alt={`Cover of ${book.title}`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    By {book.author}
                  </p>
                  <p className="text-sm line-clamp-3">{book.summary}</p>
                </CardContent>
              </Card>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit Book</AlertDialogTitle>
                <AlertDialogDescription>
                  Make changes to the book details.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={book.title}
                    onChange={(e) =>
                      setEditingBook({ ...book, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-author" className="text-right">
                    Author
                  </Label>
                  <Input
                    id="edit-author"
                    value={book.author}
                    onChange={(e) =>
                      setEditingBook({ ...book, author: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-coverImage" className="text-right">
                    Cover Image URL
                  </Label>
                  <Input
                    id="edit-coverImage"
                    value={book.coverImage}
                    onChange={(e) =>
                      setEditingBook({ ...book, coverImage: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-summary" className="text-right">
                    Summary
                  </Label>
                  <Input
                    id="edit-summary"
                    value={book.summary}
                    onChange={(e) =>
                      setEditingBook({ ...book, summary: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEditingBook(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdateBook}>
                  Save Changes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ))}
      </div>
    </div>
  );
}
