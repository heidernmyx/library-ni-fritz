"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchProviders, addProvider, updateProvider } from "@/lib/actions/book-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookProvider } from "@/lib/types/book-provider-types";
import ManageProviderDialog from "@/components/manage-provider-dialog";
import ViewProvidedBookDialog from "./view-provided-book-dialog";
import { handleViewDialog } from "@/lib/actions/book-provider";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SortKey = keyof BookProvider;

export default function BookProvidersList() {
  const [providers, setProviders] = useState<BookProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<BookProvider[]>([]);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<BookProvider | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: "asc" | "desc" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProviders().then((data) => {
      setProviders(data);
      setFilteredProviders(data.filter((provider: { isActive: any; }) => provider.isActive)); // Show active providers by default
    });
  }, []);

  const handleManage = (provider: BookProvider | null = null) => {
    setSelectedProvider(provider);
    setIsManageDialogOpen(true);
  };

  const handleSort = (key: SortKey) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedProviders = [...filteredProviders].sort((a, b) => {
      if ((a[key] ?? "") < (b[key] ?? "")) return direction === "asc" ? -1 : 1;
      if ((a[key] ?? "") > (b[key] ?? "")) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredProviders(sortedProviders);
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = providers.filter(
      (provider) =>
        provider.ProviderName.toLowerCase().includes(value) ||
        provider.Phone.toLowerCase().includes(value) ||
        provider.Email.toLowerCase().includes(value)
    );
    setFilteredProviders(filtered);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 space-y-2 md:space-y-0">
        <h2 className="text-xl font-semibold">Book Providers List</h2>
        <div className="w-full md:w-auto md:flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search provider..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Button onClick={() => handleManage()} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>

      {/* Tabs for Active and Archived Providers */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Providers</TabsTrigger>
          <TabsTrigger value="archived">Archived Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("ProviderName")}>
                    Provider Name {getSortIcon("ProviderName")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("Phone")}>
                    Phone {getSortIcon("Phone")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("Email")}>
                    Email {getSortIcon("Email")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("City")}>
                    Address {getSortIcon("City")}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders
                  .filter((provider) => provider.isActive)
                  .map((provider) => (
                    <TableRow key={provider.ProviderID}>
                      <TableCell className="font-medium">{provider.ProviderName}</TableCell>
                      <TableCell>{provider.Phone}</TableCell>
                      <TableCell>{provider.Email}</TableCell>
                      <TableCell>
                        {`${provider.Street}, ${provider.City}, ${provider.State} ${provider.PostalCode}, ${provider.Country}`}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { handleViewDialog(setIsViewDialogOpen), setSelectedProvider(provider); }}>View Provided Books</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManage(provider)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("ProviderName")}>
                    Provider Name {getSortIcon("ProviderName")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("Phone")}>
                    Phone {getSortIcon("Phone")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("Email")}>
                    Email {getSortIcon("Email")}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("City")}>
                    Address {getSortIcon("City")}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders
                  .filter((provider) => !provider.isActive)
                  .map((provider) => (
                    <TableRow key={provider.ProviderID}>
                      <TableCell className="font-medium">{provider.ProviderName}</TableCell>
                      <TableCell>{provider.Phone}</TableCell>
                      <TableCell>{provider.Email}</TableCell>
                      <TableCell>
                        {`${provider.Street}, ${provider.City}, ${provider.State} ${provider.PostalCode}, ${provider.Country}`}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => { handleViewDialog(setIsViewDialogOpen), setSelectedProvider(provider); }}>View Provided Books</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManage(provider)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Archive</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ManageProviderDialog
        isOpen={isManageDialogOpen}
        onClose={() => setIsManageDialogOpen(false)}
        onSave={addProvider}
        onUpdate={updateProvider}
        provider={selectedProvider}
      />
      <ViewProvidedBookDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        provider={selectedProvider}
      />
    </div>
  );
}
