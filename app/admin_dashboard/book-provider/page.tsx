import BookProvidersList from "@/components/book-provider";
import React from "react";

const BookProvider = () => {
  return (
   <div className="flex flex-col flex-1 mx-auto p-4 min-h-screen w-[90vw] max-w-[80%] pl-[4vw] bg-background rounded-2xl border-black solid">
      {/* <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Book Providers</h1> */}
      <BookProvidersList />
    {/* </main> */}
    </div>
  );
};

export default BookProvider;
