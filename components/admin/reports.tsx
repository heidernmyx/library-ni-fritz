import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PopularBooks from "@/components/reports/PopularBooks";
import MostReservedBooks from "@/components/reports/MostReservedBooks";

export default function Analytics() {
  return (
    <div className=" h-[90%] flex flex-col bg-white p-6 rounded-md">
      <h1 className="text-5xl font-bold p-4 m-3">Analytics</h1>
      <Tabs defaultValue="popular" className="w-full  flex flex-col rounded-md">
        <div className="sticky top-0 z-10 bg-background shadow-md w-fit">
          <TabsList className="w-full flex justify-center p-2">
            <TabsTrigger value="popular" className="flex-grow text-lg py-3">
              Popular Books
            </TabsTrigger>
            <TabsTrigger
              value="mostreserved"
              className="flex-grow text-lg py-3"
            >
              Most Reserved Books
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-grow overflow-auto p-6">
          <TabsContent value="popular" className="h-full">
            <PopularBooks />
          </TabsContent>
          <TabsContent value="mostreserved" className="h-full">
            <MostReservedBooks />
          </TabsContent>
       
        </div>
      </Tabs>
    </div>
  );
}
