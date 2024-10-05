import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

//!mao ni dire gi gawas ang getBook function sa BookPage component


async function getBook(bookId: string) {
  const res = await fetch(`https://localhost/books/${bookId}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function BookPage({
  params,
}: {
  params: { bookId: string };
}) {
  const book = await getBook(params.bookId);

  if (!book) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/books" passHref>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Books
        </Button>
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <img
            src={book.coverImage || `/placeholder.svg?height=600&width=400`}
            alt={`Cover of ${book.title}`}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">By {book.author}</p>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Summary</h2>
              <p className="text-muted-foreground">{book.summary}</p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-2">Details</h2>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>ISBN: {book.isbn}</li>
                <li>Published: {book.publishDate}</li>
                <li>Publisher: {book.publisher}</li>
                <li>Pages: {book.pageCount}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
