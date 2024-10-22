"use client"

import React from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Book, Library } from 'lucide-react'
import { Input } from "@/components/ui/input"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProviderBookList } from '@/lib/types/book-provider-types'
import { fetchBooksProvided } from '@/lib/actions/book-provider'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

const ProvidedBooksPage = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [selectedBook, setSelectedBook] = React.useState(0);
  const [providerBookList, setProviderBookList] = React.useState<ProviderBookList[]>([]);
  const [sortOption, setSortOption] = React.useState<string | null>(null); // State for sorting
  const [searchTerm, setSearchTerm] = React.useState(""); // State for search

  const params = {
    providerName: searchParams.get('name'),
    providerEmail: searchParams.get('email'),
    providerContact: searchParams.get('contact')
  }

  React.useEffect(() => {
    const fetchProviderBooksList = async () => {
      if (id) {
        setProviderBookList(await fetchBooksProvided(Number(id)));
      }
    };
    fetchProviderBooksList();
  }, [id])

  // Function to sort books based on the selected option
  const sortBooks = (books: ProviderBookList[]) => {
    if (!sortOption) return books; // No sorting if no option is selected

    const sortedBooks = [...books];

    switch (sortOption) {
      case 'title':
        return sortedBooks.sort((a, b) => a.Title.localeCompare(b.Title));
      case 'author':
        return sortedBooks.sort((a, b) => a.AuthorName.localeCompare(b.AuthorName));
      case 'year':
        return sortedBooks.sort((a, b) => new Date(a.PublicationDate).getFullYear() - new Date(b.PublicationDate).getFullYear());
      default:
        return books;
    }
  }

  const filteredAndSortedBooks = sortBooks(
    providerBookList.filter((book) => 
      book.Title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      book.AuthorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col flex-1 mx-auto p-4 min-h-[90vh] w-[90vw] max-w-7xl pl-[4vw] bg-background rounded-2xl border-black solid">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Library className="mr-2" />
          {params.providerName}'s Provided Books
        </h1>
        <pre className='flex flex-col'>
          <div className='flex'>
            Contact #: <div className='hover:underline'>{params.providerContact}</div>
          </div>
          <div className='flex'>
            Email: <div className='hover:underline'>{params.providerEmail}</div>
          </div>
        </pre>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            className="w-full"
          />
        </div>
        <Select onValueChange={(value) => setSortOption(value)}> {/* Set sort option */}
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedBooks.length > 0 ? (
          filteredAndSortedBooks.map((books: ProviderBookList) => (
            <Card key={books.BookID}>
              <CardHeader>
                <CardTitle>{books.Title}</CardTitle>
                <CardDescription className='text-base'>{books.AuthorName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Genre: {Array.isArray(books.Genres) ? books.Genres.map((genre) => (
                    <Badge variant={'default'} key={genre}>{genre}</Badge>
                  )) : null}
                </p>
                <p className="text-sm text-muted-foreground">Publication Date: {books.PublicationDate}</p>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full" onClick={() => setSelectedBook(books.BookID)}>
                      <Book className="mr-2 h-4 w-4" /> View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle className='text-4xl'>{books?.Title}</DialogTitle>
                      <DialogDescription className='text-base'>by {books?.AuthorName}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Image
                          src="/assets/gif/dragon.gif"
                          alt={books?.Title || "Dragon GIF"}
                          width={500}
                          height={500}
                          className="rounded-lg shadow-lg"
                        />
                      </div>
                      <div className="space-y-4">
                        <p><strong>ISBN:</strong> {books.ISBN}</p>
                        <p><strong>Publisher:</strong> {books?.PublisherName}</p>
                        <p><strong>Publication Date:</strong> {books?.PublicationDate}</p>
                        <p><strong>Genre:</strong> {Array.isArray(books.Genres) ? books.Genres.map((genre) => (
                          <Badge variant={'default'} key={genre}>{genre}</Badge>
                        )) : null}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p>{books?.Description ? books.Description : "No Description"}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No books found.</p>
        )}
      </div>
    </div>
  )
}

export default ProvidedBooksPage;
