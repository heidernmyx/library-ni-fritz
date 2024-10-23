import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PopularBooks from "@/components/reports/PopularBooks";
import MostReservedBooks from "@/components/reports/MostReservedBooks";
import OverdueBooks from "@/components/reports/OverdueBooks";
import LateReturners from "@/components/reports/LateReturns";

export default function Reports() {
  return (
    <div className=" h-[90%] flex flex-col bg-white p-6 rounded-md">
      <h1 className="text-5xl font-bold p-4 m-3">Reports</h1>
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
            <TabsTrigger value="overdue" className="flex-grow text-lg py-3">
              Overdue Books
            </TabsTrigger>
            <TabsTrigger value="late" className="flex-grow text-lg py-3">
              Late Returns
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
          <TabsContent value="overdue" className="h-full">
            <OverdueBooks />
          </TabsContent>
          <TabsContent value="late" className="h-full">
            <LateReturners />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
