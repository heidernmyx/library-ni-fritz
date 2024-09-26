"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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

interface BookProps {
  bookID: string;
  title: string;
  author: string;
  isbn: string;
  publicationDate: string;
  genre: string;
  location: string;
  totalCopies: number;
  availableCopies: number;
  description: string;
  providerName: string;
  updateStatus: string;
  lastUpdateDate: string;
  externalSource: string;
  externalInfo: string;
  externalLastUpdated: string;
}

export function BookCardComponent({
  bookID,
  title,
  author,
  isbn,
  publicationDate,
  genre,
  location,
  totalCopies,
  availableCopies,
  description,
  providerName,
  updateStatus,
  lastUpdateDate,
  externalSource,
  externalInfo,
  externalLastUpdated,
}: BookProps) {
  const [open, setOpen] = useState(false);

  const handleViewDetails = () => {
    setOpen(true);
  };

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="w-full aspect-[3/4] relative mb-4">
          <Image
            width={200}
            height={300}
            src={`/placeholder.svg`}
            alt={`Cover of ${title}`}
            className="object-cover rounded-md"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">By {author}</p>
        <p className="text-sm text-muted-foreground">ISBN: {isbn}</p>
        <p className="text-sm text-muted-foreground">Genre: {genre}</p>
        <p className="text-sm text-muted-foreground">Location: {location}</p>
        <p className="text-sm text-muted-foreground">
          Available Copies: {availableCopies}/{totalCopies}
        </p>
      </CardContent>
      <CardFooter>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <Button className="w-full" onClick={handleViewDetails}>
              View Details
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className="fixed w-[100vw] h-[100vh] p-0 bg-white overflow-auto"
            style={{ width: "100vw", height: "100vh" }}
          >
            <AlertDialogHeader className="p-4">
              <AlertDialogTitle className="text-xl font-bold">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-4">
                <p>
                  <strong>Author:</strong> {author}
                </p>
                <p>
                  <strong>ISBN:</strong> {isbn}
                </p>
                <p>
                  <strong>Publication Date:</strong> {publicationDate}
                </p>
                <p>
                  <strong>Genre:</strong> {genre}
                </p>
                <p>
                  <strong>Location:</strong> {location}
                </p>
                <p>
                  <strong>Total Copies:</strong> {totalCopies}
                </p>
                <p>
                  <strong>Available Copies:</strong> {availableCopies}
                </p>
                <p>
                  <strong>Description:</strong> {description}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="fixed bottom-0 left-0 w-full p-4 bg-white">
              <AlertDialogCancel className="mr-2">Close</AlertDialogCancel>
              <AlertDialogAction>Proceed</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
