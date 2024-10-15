"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ManageProviderDialog from '@/components/manage-provider-dialog';

export interface BookProvider {
  ProviderID?: number;
  ProviderName: string;
  Phone: string;
  Email: string;
  Street: string;
  City: string;
  State: string;
  Country: string;
  PostalCode: string;
}

const initialProviders: BookProvider[] = [
  {
    ProviderID: 1,
    ProviderName: 'Amazon Books',
    Phone: '+1 (800) 123-4567',
    Email: 'contact@amazon.com',
    Street: '410 Terry Ave N',
    City: 'Seattle',
    State: 'WA',
    Country: 'USA',
    PostalCode: '98109'
  },
  {
    ProviderID: 2,
    ProviderName: 'Barnes & Noble',
    Phone: '+1 (888) 987-6543',
    Email: 'info@barnesandnoble.com',
    Street: '122 Fifth Avenue',
    City: 'New York',
    State: 'NY',
    Country: 'USA',
    PostalCode: '10011'
  },
];

type SortKey = keyof BookProvider;

export default function BookProvidersList() {
  const [providers, setProviders] = useState<BookProvider[]>(initialProviders);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<BookProvider | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const handleManage = (provider: BookProvider | null = null) => {
    setSelectedProvider(provider);
    setIsManageDialogOpen(true);
  };

  const handleSaveProvider = (provider: BookProvider) => {
    if (provider.ProviderID) {
      setProviders(providers.map(p => p.ProviderID === provider.ProviderID ? provider : p));
    } else {
      const newProvider = { ...provider, ProviderID: Math.max(0, ...providers.map(p => p.ProviderID || 0)) + 1 };
      setProviders([...providers, newProvider]);
    }
    setIsManageDialogOpen(false);
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedProviders = [...providers].sort((a, b) => {
      if ((a[key] ?? '') < (b[key] ?? '')) return direction === 'asc' ? -1 : 1;
      if ((a[key] ?? '') > (b[key] ?? '')) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setProviders(sortedProviders);
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Book Providers List</h2>
        <Button onClick={() => handleManage()} className="bg-green-600 hover:bg-green-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Provider
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('ProviderName')}>
                Provider Name {getSortIcon('ProviderName')}
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
            {providers.map((provider) => (
              <TableRow key={provider.ProviderID}>
                <TableCell className="font-medium">{provider.ProviderName}</TableCell>
                <TableCell>{provider.Phone}</TableCell>
                <TableCell>{provider.Email}</TableCell>
                <TableCell>
                  {`${provider.Street}, ${provider.City}, ${provider.State} ${provider.PostalCode}, ${provider.Country}`}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleManage(provider)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ManageProviderDialog
        isOpen={isManageDialogOpen}
        onClose={() => setIsManageDialogOpen(false)}
        onSave={handleSaveProvider}
        provider={selectedProvider}
      />
    </div>
  );
}