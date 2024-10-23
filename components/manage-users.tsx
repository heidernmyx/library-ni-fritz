import React, { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { UserProps } from '@/lib/types/user-types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, ArrowDown, ArrowUp, UserIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  addUser, 
  updateUser, 
  archiveUser,
  restoreUser, 
  list_users, 
  deleteUser }
from '@/lib/actions/users';
import ManageUserDialog from './manage-user-dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ManageUsersProps {
  sessionData: Session | null;
}

const ManageUsers: React.FC<ManageUsersProps> = ({ sessionData }) => {
  const [isManageDialogOpen, setIsManageDialogOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [usersList, setUsersList] = useState<UserProps[]>([]);

  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term state
  const [sortColumn, setSortColumn] = useState<string>(''); // Column to sort by
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Sort direction (asc or desc)
  const [filterRole, setFilterRole] = useState<string>('None'); // Filter option state
  const [filterGender, setFilterGender] = useState<string>('None');
  const [status, setStatus] = useState<number>(1);

  useEffect(() => {
    console.log(sessionData?.user.id);
    console.log(sessionData?.user.usertype);
    const fetchUsers = async () => {
      if (sessionData?.user.id) {
        setUsersList(await list_users(Number(sessionData.user.id)));
      }
    };
    fetchUsers();
  }, [sessionData?.user.id]);

  // Search and Filter
  const filteredUsers = usersList.filter(user => {
    const fullName = `${user.Fname} ${user.Mname ? user.Mname[0] + '. ' : ''}${user.Lname}`;
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }).filter(user => {
    
    const roleFilter = filterRole === 'None' ? true : user.RoleName === filterRole;
    const genderFilter = filterGender === 'None' ? true : user.GenderName === filterGender;

    return roleFilter && genderFilter;
  });

  // Sort
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const directionFactor = sortDirection === 'asc' ? 1 : -1;

    if (sortColumn === 'name') {
      return directionFactor * a.Fname.localeCompare(b.Fname);
    } else if (sortColumn === 'email') {
      return directionFactor * a.Email.localeCompare(b.Email);
    } else if (sortColumn === 'role') {
      return directionFactor * a.RoleName.localeCompare(b.RoleName);
    } else if (sortColumn === 'user_id') {
      return directionFactor * (a.UserID - b.UserID);
    }
    return 0; // No sort applied
  });

  // Handle table header click to toggle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // If the same column is clicked, toggle the direction
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      // If a different column is clicked, set it as the new sort column and default to ascending order
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? <ArrowUp className="ml-1 inline-block" /> : <ArrowDown className="ml-1 inline-block" />;
    }
    return null;
  };

  const handleManage = async (user: UserProps | null = null) => {
    setSelectedUser(user);
    setIsManageDialogOpen(true);
  };

  return (
    <div>
      <Tabs defaultValue="Active">
        <header className="mb-2">
          <h1 className="text-3xl font-bold mb-1 flex items-center">
            <UserIcon className='mr-1'/>
            User Lists
          </h1>
          <pre className="flex flex-col text-muted-foreground">
            These are the lists of registered users
          </pre>
        </header>
        <TabsList>
          <TabsTrigger onClick={() => setStatus(1)} value="Active">Active</TabsTrigger>
          <TabsTrigger onClick={() => setStatus(0)} value="Inactive">Inactive</TabsTrigger>
        </TabsList>
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className='flex ml-20 space-x-6'>
            {/* Leave the role filter here */}
            <div className='flex space-x-2 items-center'>
              <Label htmlFor='roleFilter'>Role: </Label>
              <Select  onValueChange={setFilterRole}>
                <SelectTrigger name='roleFilter' id='roleFilter' className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='None'>None</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Librarian">Librarian</SelectItem>
                  <SelectItem value="Registered User">Registered User</SelectItem>
                  {/* Add more roles as needed */}
                </SelectContent>
              </Select>
            </div>

            <div className='flex space-x-2 items-center'>
              <Label htmlFor='genderFilter'>Gender: </Label>
              <Select  onValueChange={setFilterGender}>
                <SelectTrigger name='genderFilter' id='genderFilter' className="w-[180px]">
                  <SelectValue placeholder="Filter by Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='None'>None</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                  {/* Add more roles as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={() => handleManage()} className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
        {/* <TabsContent value='Active'> */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('user_id')} className="cursor-pointer">
                UserID {getSortIcon('user_id')}
              </TableHead>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Name {getSortIcon('name')}
              </TableHead>
              <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                Email {getSortIcon('email')}
              </TableHead>
              <TableHead>Phone #</TableHead>
              <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                Role {getSortIcon('role')}
              </TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedUsers.filter(user => user.Status == status).map((user: UserProps) => (
              <TableRow key={user.UserID}>
                <TableCell className="font-medium">{user.UserID}</TableCell>
                <TableCell>{`${user.Fname} ${user.Mname ? user.Mname[0] + '. ' : ''}${user.Lname}`}</TableCell>
                <TableCell>{user.Email}</TableCell>
                <TableCell>{user.Phone}</TableCell>
                <TableCell>{user.RoleName}</TableCell>
                <TableCell>{user.GenderName}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      { status == 1 ? 
                        <>
                          <DropdownMenuItem onClick={() => handleManage(user)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => archiveUser(user.UserID)}>Archive</DropdownMenuItem>
                        </>
                      : <>
                          <DropdownMenuItem onClick={() => restoreUser(user.UserID)}>Restore</DropdownMenuItem>
                          {/* <DropdownMenuItem onClick={() => deleteUser(user.UserID)}>Delete Permanently</DropdownMenuItem> */}
                        </>
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* </TabsContent> */}
        
      </Tabs>

      <ManageUserDialog
        isOpen={isManageDialogOpen}
        onClose={() => setIsManageDialogOpen(false)}
        onSave={addUser}
        onUpdate={updateUser}
        user={selectedUser}
        session={sessionData}
      />
    </div>
  );
};

export default ManageUsers;
