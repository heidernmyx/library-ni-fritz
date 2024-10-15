import BookProvidersTable from "@/components/BooksProviderTable";
import React from "react";

const BookProvider = () => {
  return (
    <div className="flex flex-col w-[80%]">
      <BookProvidersTable />
    </div>
  );
};

export default BookProvider;
