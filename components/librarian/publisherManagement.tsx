"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Session } from 'next-auth';

interface Publisher {
  PublisherID: number;
  PublisherName: string;
  Phone: string;
  Email: string;
  Street: string;
  City: string;
  State: string;
  Country: string;
  PostalCode: string;
  IsActive: boolean;
  user_id: number;
}

type SortKey = keyof Pick<Publisher, "PublisherName" | "Phone" | "Email" | "City">;

export default function PublisherManager() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [filteredPublishers, setFilteredPublishers] = useState<Publisher[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [operation, setOperation] = useState<'addPublisher' | 'updatePublisher'>('addPublisher');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [sessionData, setSessionData] = useState<Session | null>(null);
  const [formValues, setFormValues] = useState({
    PublisherName: '',
    Phone: '',
    Email: '',
    Street: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await axios.get('/api/getSession');
        setSessionData(response.data.session);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
    fetchPublishers();
  }, []);

  const fetchPublishers = async () => {
    try {
      const response = await axios.get('http://localhost/library_api/php/bookpublisher.php', {
        params: { operation: 'fetchPublishers' },
      });
      setPublishers(response.data);
      setFilteredPublishers(response.data);
    } catch (error) {
      console.error('Error fetching publishers:', error);
    }
  };

  const handleOpenDialog = (publisher: Publisher | null = null) => {
    setSelectedPublisher(publisher);
    if (publisher) {
      setFormValues({
        PublisherName: publisher.PublisherName || '',
        Phone: publisher.Phone || '',
        Email: publisher.Email || '',
        Street: publisher.Street || '',
        City: publisher.City || '',
        State: publisher.State || '',
        Country: publisher.Country || '',
        PostalCode: publisher.PostalCode || '',
      });
      setOperation('updatePublisher');
    } else {
      setFormValues({
        PublisherName: '',
        Phone: '',
        Email: '',
        Street: '',
        City: '',
        State: '',
        Country: '',
        PostalCode: '',
      });
      setOperation('addPublisher');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!sessionData) return;

    // Create form data similar to your required format
    const formData = new FormData();
    formData.append('operation', operation); // Add the operation parameter
    formData.append(
      'json',
      JSON.stringify({
        PublisherName: formValues.PublisherName,
        Phone: formValues.Phone,
        Email: formValues.Email,
        Street: formValues.Street,
        City: formValues.City,
        State: formValues.State,
        Country: formValues.Country,
        PostalCode: formValues.PostalCode,
        user_id: sessionData.user.id, // Include user_id in the JSON payload
      })
    );

    try {
      const response = await axios.post('http://localhost/library_api/php/bookpublisher.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        fetchPublishers();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error submitting publisher:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedPublishers = [...filteredPublishers].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredPublishers(sortedPublishers);
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = publishers.filter(
      (publisher) =>
        publisher.PublisherName.toLowerCase().includes(value) ||
        publisher.Phone.toLowerCase().includes(value) ||
        publisher.Email.toLowerCase().includes(value)
    );
    setFilteredPublishers(filtered);
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center mb-4 space-y-2 md:space-y-0">
        <h2 className="text-xl font-semibold">Book Publishers List</h2>
        <div className="w-full md:w-auto md:flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search publisher..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full"
          />
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Publisher
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('PublisherName')}>
                Publisher Name {getSortIcon('PublisherName')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Phone')}>
                Phone {getSortIcon('Phone')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Email')}>
                Email {getSortIcon('Email')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('City')}>
                Address {getSortIcon('City')}
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPublishers.length > 0 ? (
              filteredPublishers.map((publisher) => (
                <TableRow key={publisher.PublisherID}>
                  <TableCell className="font-medium">{publisher.PublisherName}</TableCell>
                  <TableCell>{publisher.Phone}</TableCell>
                  <TableCell>{publisher.Email}</TableCell>
                  <TableCell>
                    {`${publisher.Street}, ${publisher.City}, ${publisher.State} ${publisher.PostalCode}, ${publisher.Country}`}
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
                        <DropdownMenuItem onClick={() => handleOpenDialog(publisher)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No publishers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{operation === 'addPublisher' ? 'Add Publisher' : 'Update Publisher'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <Input name="PublisherName" placeholder="Publisher Name" value={formValues.PublisherName} onChange={handleInputChange} />
            <Input name="Phone" placeholder="Phone" value={formValues.Phone} onChange={handleInputChange} />
            <Input name="Email" placeholder="Email" value={formValues.Email} onChange={handleInputChange} />
            <Input name="Street" placeholder="Street" value={formValues.Street} onChange={handleInputChange} />
            <Input name="City" placeholder="City" value={formValues.City} onChange={handleInputChange} />
            <Input name="State" placeholder="State" value={formValues.State} onChange={handleInputChange} />
            <Input name="Country" placeholder="Country" value={formValues.Country} onChange={handleInputChange} />
            <Input name="PostalCode" placeholder="Postal Code" value={formValues.PostalCode} onChange={handleInputChange} />
            <Button type="button" className="w-full" onClick={handleSubmit}>
              {operation === 'addPublisher' ? 'Add Publisher' : 'Update Publisher'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
