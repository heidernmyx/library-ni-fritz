"use client";
//!boss mao ning Book card nga pede nato gamiton sa pag maap sa books sayop pa ang interface ani
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";

interface AddBookForm {
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  genre: string;
  location: string;
  totalCopies: number;
  availableCopies: number;
  providerID: number;
}

export function AddBookComponent() {
  const [formData, setFormData] = useState<AddBookForm>({
    title: "",
    author: "",
    isbn: "",
    publicationDate: "",
    genre: "",
    location: "",
    totalCopies: 1,
    availableCopies: 1,
    providerID: 1,
  });
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalCopies" ||
        name === "availableCopies" ||
        name === "providerID"
          ? Number(value)
          : value,
    }));
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const {
      title,
      author,
      isbn,
      publicationDate,
      genre,
      location,
      totalCopies,
      availableCopies,
      providerID,
    } = formData;
    if (
      !title.trim() ||
      !author.trim() ||
      !isbn.trim() ||
      !publicationDate.trim() ||
      !genre.trim() ||
      !location.trim()
    ) {
      setMessage({
        type: "error",
        text: "All fields except Provider ID are required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/php/books.php?action=add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Book added successfully." });
        setFormData({
          title: "",
          author: "",
          isbn: "",
          publicationDate: "",
          genre: "",
          location: "",
          totalCopies: 1,
          availableCopies: 1,
          providerID: 1,
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to add book.",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <Card>
        <CardContent>
          <form onSubmit={handleAddBook} className="flex flex-col gap-4">
            <Input
              type="text"
              name="title"
              placeholder="Book Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="author"
              placeholder="Author Name"
              value={formData.author}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              name="publicationDate"
              placeholder="Publication Date"
              value={formData.publicationDate}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="genre"
              placeholder="Genre"
              value={formData.genre}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <Input
              type="number"
              name="totalCopies"
              placeholder="Total Copies"
              value={formData.totalCopies}
              onChange={handleChange}
              min={1}
              required
            />
            <Input
              type="number"
              name="availableCopies"
              placeholder="Available Copies"
              value={formData.availableCopies}
              onChange={handleChange}
              min={0}
              max={formData.totalCopies}
              required
            />
            <Input
              type="number"
              name="providerID"
              placeholder="Provider ID"
              value={formData.providerID}
              onChange={handleChange}
              min={1}
              required
            />
            {message && (
              <Alert
                variant={message.type === "error" ? "destructive" : "default"}
              >
                <AlertTitle>
                  {message.type === "error" ? "Error" : "Success"}
                </AlertTitle>
                {message.text}
              </Alert>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Book"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
