"use client";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

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

export function BookSearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "") {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/php/books.php?action=fetch`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch books.");
      }
      const data: Book[] = await response.json();
      const filtered = data.filter(
        (book) =>
          book.Title.toLowerCase().includes(query.toLowerCase()) ||
          book.Author.toLowerCase().includes(query.toLowerCase()) ||
          book.ISBN.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={containerRef}>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          type="search"
          placeholder="Search for books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>
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
      {results.length > 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-80 overflow-y-auto">
          <Card>
            <CardContent className="p-0">
              {results.map((book) => (
                <div
                  key={book.BookID}
                  className="p-4 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer"
                >
                  <h3 className="font-semibold">{book.Title}</h3>
                  <p className="text-sm text-gray-600">by {book.Author}</p>
                  <p className="text-sm text-gray-600">ISBN: {book.ISBN}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
      {query.trim() !== "" && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-4">
          <p className="text-center text-gray-500">No books found.</p>
        </div>
      )}
    </div>
  );
}
