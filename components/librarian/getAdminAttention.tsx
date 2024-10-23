import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertTitle } from '../ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { toast } from '@/hooks/use-toast';


interface OverdueBook {
  BorrowID: number;
  UserID: number;
  Fname: string;
  Title: string;
  DueDate: string; 
  DaysOverdue: number;
}

interface DueSoonBook {
  BorrowID: number;
  UserID: number;
  Fname: string;
  Title: string;
  DueDate: string; 
  DaysUntilDue: number;
}

interface ExpiringReservation {
  ReservationID: number;
  UserID: number;
  Fname: string;
  Title: string;
  ExpirationDate: string; 
  DaysUntilExpiry: number;
}

interface UserWithLateFee {
  UserID: number;
  Fname: string;
  Email: string;
  FeeAmount: number;
  FeeDate: string; 
}

interface AdminAttentionListData {
  overdueBooks: OverdueBook[];
  dueSoonBooks: DueSoonBook[];
  expiringReservations: ExpiringReservation[];
  usersWithLateFees: UserWithLateFee[];
}

const AdminAttentionList: React.FC = () => {
  const [data, setData] = useState<AdminAttentionListData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

     const handleSendReminder = async (reminderType: string) => { 
    try { 
      const formData = new FormData()
      formData.append("operation", reminderType)
     
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/books.php`,
        formData
      )
      if (response.data.success) {
        toast({
          title: "Reminder Sent",
          description: "The reminder has been sent successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to send the reminder.",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response
          ? err.response.data.message
          : "An error occurred while sending the reminder.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const fetchAttentionList = async () => {
      try {
          const response = await axios.get<AdminAttentionListData>(`${process.env.NEXT_PUBLIC_API_URL}/reports.php`,
          {params: {operation: 'getAdminAttentionList'}});
        setData(response.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch admin attention list.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttentionList();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        
        <span className="ml-4 text-lg">Loading admin attention list...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert variant="destructive">
        <AlertTitle>No Data</AlertTitle>
        No data available.
      </Alert>
    );
  }

    
  return (
    <div className="space-y-8 p-4 bg-white m-4 rounded-md ">
    <div className='flex  justify-between flex-1'>  <h1 className="text-3xl font-bold ">Admin Attention List</h1>
<Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Send Reminders</Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit bg-transparent border-none">
        <div className="flex flex-col justify-evenly gap-2  ">
                  <Button className="w-fit" onClick={()=> handleSendReminder("sendReservationExpiryReminders")}>Send Reservation Expiry</Button>
                  <Button className="w-fit" onClick={() => handleSendReminder("sendDueDateReminders")}>Send Due Date Reminder</Button>
                  <Button className="w-fit" onClick={()=> handleSendReminder("sendOverdueNotices")}>Send Overdue Reminder</Button> 
        </div>
      </PopoverContent>
    </Popover></div>
      {/* Overdue Books Section */}
      <Card className='shadow-2xl'>
        <CardHeader>
          <CardTitle>Overdue Books</CardTitle>
        </CardHeader>
        <CardContent>
          {data.overdueBooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Borrowed By</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Days Overdue</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.overdueBooks.map((book) => (
                  <TableRow key={book.BorrowID}>
                    <TableCell>{book.Title}</TableCell>
                    <TableCell>{book.Fname}</TableCell>
                    <TableCell>{new Date(book.DueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-red-500 font-semibold">
                      {book.DaysOverdue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No overdue books.</p>
          )}
        </CardContent>
      </Card>

      {/* Books Due Soon Section */}
      <Card className='shadow-2xl'>
        <CardHeader>
          <CardTitle>Books Due Soon</CardTitle>
        </CardHeader>
        <CardContent>
          {data.dueSoonBooks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Borrowed By</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Days Until Due</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.dueSoonBooks.map((book) => (
                  <TableRow key={book.BorrowID}>
                    <TableCell>{book.Title}</TableCell>
                    <TableCell>{book.Fname}</TableCell>
                    <TableCell>{new Date(book.DueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-orange-500 font-semibold">
                      {book.DaysUntilDue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No books due soon.</p>
          )}
        </CardContent>
      </Card>

      {/* Expiring Reservations Section */}
      <Card className='shadow-2xl'>
        <CardHeader>
          <CardTitle>Expiring Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {data.expiringReservations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Reserved By</TableCell>
                  <TableCell>Expiration Date</TableCell>
                  <TableCell>Days Until Expiry</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expiringReservations.map((reservation) => (
                  <TableRow key={reservation.ReservationID}>
                    <TableCell>{reservation.Title}</TableCell>
                    <TableCell>{reservation.Fname}</TableCell>
                    <TableCell>{new Date(reservation.ExpirationDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-purple-500 font-semibold">
                      {reservation.DaysUntilExpiry}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-500">No reservations expiring soon.</p>
          )}
        </CardContent>
      </Card>

     
      
    </div>
  );
};



export default AdminAttentionList;
