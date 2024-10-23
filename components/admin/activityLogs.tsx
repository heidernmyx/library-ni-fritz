'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, Search } from 'lucide-react';

type Log = {
  LogID: number;
  Fname: string;
  Context: string;
  Date: string;
  Action: string;
};

type SortKey = keyof Log;

export default function LogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  // Dynamic parseAction function to match variations of words in the context
  const parseAction = (context: string): string => {
    const lowerContext = context.toLowerCase();
    
    if (/reserve|reservation/.test(lowerContext)) {
      return 'Reservation';
    } else if (/borrow|borrowed/.test(lowerContext)) {
      return 'Borrowed';
    } else if (/update|updated/.test(lowerContext)) {
      return 'Updated';
    } else if (/cancel|cancelled/.test(lowerContext)) {
      return 'Cancelled';
    } else if (/add|added/.test(lowerContext)) {
      return 'Added';
    } else if (/archive/.test(lowerContext)) {
      return 'Archived';
    } else if (/book/.test(lowerContext)) {
      return 'Book Activity';
    }
    return 'Other';
  };

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/books.php?operation=fetchLogs`);
      const parsedLogs = response.data.logs.map((log: any) => ({
        ...log,
        Action: parseAction(log.Context),
      }));
      setLogs(parsedLogs);
      setFilteredLogs(parsedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedLogs = [...filteredLogs].sort((a, b) => {
      if ((a[key] ?? '') < (b[key] ?? '')) return direction === 'asc' ? -1 : 1;
      if ((a[key] ?? '') > (b[key] ?? '')) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLogs(sortedLogs);
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
    const filtered = logs.filter(
      (log) =>
        log.Fname.toLowerCase().includes(value) ||
        log.Context.toLowerCase().includes(value) ||
        log.Date.toLowerCase().includes(value) ||
        log.Action.toLowerCase().includes(value)
    );
    setFilteredLogs(filtered);
  };

  const handleFilterByAction = (actionType: string) => {
    const filtered = logs.filter((log) => log.Action === actionType);
    setFilteredLogs(filtered);
  };

  return (
    <div className="w-full mx-auto p-6 space-y-6 bg-background rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-5xl font-bold  p-4 m-3 text-primary">Logs List</h2>
        <div className="w-full md:w-64">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => handleFilterByAction('Reservation')}
          variant="outline"
          className="bg-blue-100 hover:bg-blue-200 text-blue-700"
        >
          Reservation Activities
        </Button>
        <Button
          onClick={() => handleFilterByAction('Borrowed')}
          variant="outline"
          className="bg-green-100 hover:bg-green-200 text-green-700"
        >
          Borrowed Activities
        </Button>
        <Button
          onClick={() => handleFilterByAction('Updated')}
          variant="outline"
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
        >
          Updated Activities
        </Button>
        <Button
          onClick={() => handleFilterByAction('Added')}
          variant="outline"
          className="bg-purple-100 hover:bg-purple-200 text-purple-700"
        >
          Added Activities
        </Button>
        <Button
          onClick={() => setFilteredLogs(logs)}
          variant="outline"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Reset Filter
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Fname')}>
                User Name {getSortIcon('Fname')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Context')}>
                Activity {getSortIcon('Context')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Date')}>
                Date {getSortIcon('Date')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('Action')}>
                Action {getSortIcon('Action')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.LogID}>
                  <TableCell className="font-medium">{log.Fname}</TableCell>
                  <TableCell>{log.Context}</TableCell>
                  <TableCell>{new Date(log.Date).toLocaleString()}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.Action === 'Reservation'
                          ? 'bg-blue-100 text-blue-700'
                          : log.Action === 'Borrowed'
                          ? 'bg-green-100 text-green-700'
                          : log.Action === 'Updated'
                          ? 'bg-yellow-100 text-yellow-700'
                          : log.Action === 'Added'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {log.Action}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
