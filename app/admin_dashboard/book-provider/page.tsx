import BookProvidersTable from "@/components/BooksProviderTable";
import React from "react";

const BookProvider = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book Providers Management</h1>
      <BookProvidersTable />
    </div>
  );
};

export default BookProvider;
