"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserProps } from '@/lib/types/user-types'; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Session } from 'next-auth';
// import { useForm } from 'react-hook-form';

interface ManageUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserProps) => void;
  onUpdate: (user: UserProps) => void;
  user: UserProps | null;
  session: Session | null
}

export default function ManageUserDialog({ isOpen, onClose, onSave, onUpdate, user, session }: ManageUserDialogProps) {

  
  const [formData, setFormData] = useState<UserProps>({
    UserID: 0,
    Name: '',
    Email: '',
    Phone: '',
    RoleName: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {  
      setFormData({
        UserID: 0,
        Name: '',
        Email: '',
        Phone: '',
        RoleName: ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // const result = updateProvider(formData)
      // alert(provider)  
      onUpdate(formData)
    }
    else {
      alert(true)
      onSave(formData);
    }
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ProviderName">User Name</Label>
            <Input
              id="ProviderName"
              name="ProviderName"
              value={formData.Name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="Phone">Phone</Label>
            <Input
              id="Phone"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
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
          { <div className="space-y-2">
            <Label htmlFor="Street">Role</Label>
            <Select>
              <SelectTrigger className="w-[100%]">
                <SelectValue placeholder={`${formData.RoleName}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Librarian</SelectItem>
                <SelectItem value="3">Registered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          }
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