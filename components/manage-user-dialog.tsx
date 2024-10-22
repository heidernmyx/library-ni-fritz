"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserFormProps, UserProps } from '@/lib/types/user-types'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Session } from 'next-auth';

interface ManageUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserFormProps) => void;
  onUpdate: (user: UserFormProps) => void;
  user: UserProps | null;
  session: Session | null
}

export default function ManageUserDialog({ isOpen, onClose, onSave, onUpdate, user, session }: ManageUserDialogProps) {

  const [formData, setFormData] = useState<UserFormProps>({
    UserID: 0,
    Fname: '',
    Mname: '',
    Lname: '',
    Email: '',
    Phone: '',
    RoleID: session?.user.usertype != "Admin" ? 3 : 0,
    GenderID: 0,
    // RoleName: '',
    // GenderName: ''
  });

  // Auto-populate formData with user details if editing
  useEffect(() => {
    if (user) {
      // Map RoleName to RoleID and GenderName to GenderID
      const roleID = user.RoleName === "Admin" ? 1 : user.RoleName === "Librarian" ? 2 : 3; // Example mapping
      const genderID = user.GenderName === "Male" ? 1 : user.GenderName === "Female" ? 2 : 3; // Example mapping
      
      // Set form data with mapped RoleID and GenderID
      setFormData({
        UserID: user.UserID,
        Fname: user.Fname,
        Mname: user.Mname || '',
        Lname: user.Lname,
        Email: user.Email,
        Phone: user.Phone,
        RoleID: roleID,  // Mapped RoleID
        GenderID: genderID  // Mapped GenderID
      });
    } else {
      // Reset form for a new user
      setFormData({
        UserID: 0,
        Fname: '',
        Mname: '',
        Lname: '',
        Email: '',
        Phone: '',
        RoleID: 3,
        GenderID: 0
      });
    }
  }, [user]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData)
    if (user) {
      onUpdate(formData); // Update user if editing
    } else {
      onSave(formData); // Save new user if adding
    }
  };
  
  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, RoleID: parseInt(value, 10) });
  };
  
  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, GenderID: parseInt(value, 10) });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="Fname">First Name</Label>
            <Input
              id="Fname"
              name="Fname"
              value={formData.Fname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="Mname">Middle Name</Label>
            <Input
              id="Mname"
              name="Mname"
              value={formData.Mname}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="Lname">Last Name</Label>
            <Input
              id="Lname"
              name="Lname"
              value={formData.Lname}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="Phone">Phone</Label>
            <Input
              id="Phone"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="Email">Email</Label>
            <Input
              id="Email"
              name="Email"
              type="email"
              value={formData.Email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {session?.user.usertype === "Admin" ? (
              <div className="space-y-1">
                <Label htmlFor="Role">Role</Label>
                <Select value={`${formData.RoleID}`} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="2">Librarian</SelectItem>
                    <SelectItem value="3">Registered User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ): <div className="space-y-1">
                <Label htmlFor="Role">Role</Label>
                <Select 
                  name="RoleID"
                  value={formData.RoleID ? `${formData.RoleID}` : '3'} // Fallback to Registered User if RoleID is not set
                  disabled={session?.user.usertype !== "Admin"} // Disable for non-admins
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Admin</SelectItem>
                    <SelectItem value="2">Librarian</SelectItem>
                    <SelectItem value="3">Registered User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            }
            <div className="space-y-1">
              <Label htmlFor="Gender">Gender</Label>
              <Select value={`${formData.GenderID}`} onValueChange={handleGenderChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Male</SelectItem>
                  <SelectItem value="2">Female</SelectItem>
                  <SelectItem value="3">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            { user ? <Button type="submit">Update</Button> : 
            <Button type="submit">Add</Button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
