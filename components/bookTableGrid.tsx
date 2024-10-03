"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { BookCardComponent } from "./book-card";

interface Book {
  BookID: string;
  Title: string;
  Author: string;
  ISBN: string;
  PublicationDate: string;
  Genre: string;
  Location: string;
  TotalCopies: number;
  AvailableCopies: number;
  Description: string;
  ProviderName: string;
  UpdateStatus: string;
  LastUpdateDate: string;
  ExternalSource: string;
  ExternalInfo: string;
  ExternalLastUpdated: string;
}

export function BookTableGrid() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  const fetchBooks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = (currentPage - 1) * booksPerPage;
      const url = `${process.env.NEXT_PUBLIC_API_URL}/php/books.php?action=fetch&limit=${booksPerPage}&offset=${offset}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch books.");
      }
      const data: Book[] = await response.json();
      setBooks(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto relative">
      {isLoading && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
          <p className="text-center text-gray-500">Loading...</p>
        </div>
      )}
      {error && (
        <div className="absolute top-full left-0 w-full mt-2 bg-red-100 border border-red-400 rounded shadow-lg z-10 p-4">
          <p className="text-center text-red-700">{error}</p>
        </div>
      )}
      {books.length > 0 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-4 max-h-96 overflow-y-auto">
            {books.map((book) => (
              <BookCardComponent
                key={book.BookID}
                bookID={book.BookID}
                title={book.Title}
                author={book.Author}
                isbn={book.ISBN}
                publicationDate={book.PublicationDate}
                genre={book.Genre}
                location={book.Location}
                totalCopies={book.TotalCopies}
                availableCopies={book.AvailableCopies}
                description={book.Description}
                providerName={book.ProviderName}
                updateStatus={book.UpdateStatus}
                lastUpdateDate={book.LastUpdateDate}
                externalSource={book.ExternalSource}
                externalInfo={book.ExternalInfo}
                externalLastUpdated={book.ExternalLastUpdated}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={books.length < booksPerPage}
            >
              Next
            </Button>
          </div>
        <div/>
      )}
      {!isLoading && books.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
          <p className="text-center text-gray-500">No books found.</p>
        </div>
      )}
    </div>
  );
}
