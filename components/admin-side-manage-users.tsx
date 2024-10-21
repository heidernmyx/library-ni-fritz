
import React from 'react';
import { Session, User } from 'next-auth';
import { list_users } from '@/lib/actions/users';
import { UserProps } from '@/lib/types/user-types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowUpDown, MoreHorizontal, UserCog2Icon } from 'lucide-react';

// import { fetchProviders, addProvider, updateProvider } from '@/lib/actions/book-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { addUser, updateUser } from '@/lib/actions/users';
import { BookProvider } from '@/lib/types/book-provider-types';
import ManageUserDialog from './manage-user-dialog';
import ViewProvidedBookDialog from './view-provided-book-dialog';
import { handleViewDialog } from '@/lib/actions/book-provider'
import axios from "axios";
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AdminSideManageUsersProps {
  sessionData: Session | null;
  // users?: UserProps[];
}

// type AdminSideManageUsersProps = {
  
// };

const AdminSideManageUsers: React.FC<AdminSideManageUsersProps> = ({ sessionData }) => {

  const [ isManageDialogOpen, setIsManageDialogOpen ] = useState<boolean>(false);
  const [ selectedUser, setSelectedUser ] = useState<UserProps | null>(null);
  const [ usersList, setUsersList ] = useState<UserProps[]>([]); 

  React.useEffect(() => {
    const fetchUsers = async () => {
      if (sessionData?.user.id) {
        setUsersList(await list_users(Number(sessionData!.user.id)));
      }
    }
    fetchUsers();
  }, [sessionData?.user.id])

  // React.useEffect(() => {
  //   const fetchProviderBooksList = async () => {
  //     if (id) {
  //       setProviderBookList(await fetchBooksProvided(Number(id)));
  //     }
  //   };
  //   fetchProviderBooksList();
  // }, [id])

  const handleManage = async (user: UserProps) => {
    setSelectedUser(user);
    setIsManageDialogOpen(true);
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <UserCog2Icon className="mr-2" />
          User Lists
        </h1>
        <pre className='flex flex-col text-muted-foreground'>
          {/* <div className='flex'>
            Contact #: <div className='hover:underline'>{params.providerContact}</div>
          </div>
          <div className='flex'>
            Email: <div className='hover:underline'>{params.providerEmail}</div>
          </div> */}
          These are the lists of registered users
        </pre>
      </header>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 max-w-sm">
          <Input
            type="search"
            placeholder="Search books..."
            // value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            className="w-full"
          />
        </div>
        <Select 
          // onValueChange={(value) => setSortOption(value)}
        > {/* Set sort option */}
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="author">Author</SelectItem>
            <SelectItem value="year">Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer">
                UserID 
              </TableHead>
              <TableHead className="cursor-pointer" >
                Name
              </TableHead>
              <TableHead className="cursor-pointer">
                Email 
              </TableHead>
              <TableHead className="cursor-pointer" >
                Phone #
              </TableHead>
              <TableHead className="cursor-pointer" >
                Role 
              </TableHead>
              <TableHead className="cursor-pointer" >
                Gender 
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map((users: UserProps) => (
              <TableRow key={users.UserID}>
                <TableCell className="font-medium">{users.UserID}</TableCell>
                <TableCell>{[users.Fname," ", users.Mname ? String(users.Mname[0]).toLocaleUpperCase() + ". " : '', users.Lname]}</TableCell>
                <TableCell>{users.Email}</TableCell>
                <TableCell>
                  {/* {`${provider.Street}, ${provider.City}, ${provider.State} ${provider.PostalCode}, ${provider.Country}`} */}
                  {users.Phone}
                </TableCell>
                <TableCell>
                  {/* <Button variant="outline" size="sm" >
                    Manage
                  </Button> */}
                  {users.RoleName}
                </TableCell>
                <TableCell>
                  {users.GenderName}
                </TableCell>
                <TableCell>
                  {/* <Button variant="outline" size="sm" >
                    Manage
                  </Button> */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-haspopup="true"
                        size="icon"
                        variant="ghost"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {/* <DropdownMenuItem
                        // onClick={() => {handleViewDialog(setIsViewDialogOpen), setSelectedProvider(provider), console.log(provider)}}
                        >View Provided Books</DropdownMenuItem> */}
                      <DropdownMenuItem 
                      onClick={() => handleManage(users)}
                        >Edit</DropdownMenuItem>
                      <DropdownMenuItem>Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      <ManageUserDialog
        isOpen={isManageDialogOpen}
        onClose = {() => setIsManageDialogOpen(false)}
        onSave = {addUser}
        onUpdate = {updateUser}
        user={selectedUser}
        session={sessionData}
      />
    </div>
  );
};
export default AdminSideManageUsers;
