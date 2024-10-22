"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookProvider } from '@/lib/types/book-provider-types';
import { updateProvider } from '@/lib/actions/book-provider';
// import { useForm } from 'react-hook-form';

interface ManageProviderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (provider: BookProvider) => void;
  onUpdate: (provider: BookProvider) => void;
  provider: BookProvider | null;
}

export default function ManageProviderDialog({ isOpen, onClose, onSave, onUpdate, provider }: ManageProviderDialogProps) {
  const [formData, setFormData] = useState<BookProvider>({
    ProviderID: 0,
    ContactID: 0,
    AddressID: 0,
    ProviderName: '',
    Phone: '',
    Email: '',
    Street: '',
    City: '',
    State: '',
    Country: '',
    PostalCode: '',
  });

  useEffect(() => {
    if (provider) {
      setFormData(provider);
    } else {  
      setFormData({
        ProviderID: 0,
        ContactID: 0,
        AddressID: 0,
        ProviderName: '',
        Phone: '',
        Email: '',
        Street: '',
        City: '',
        State: '',
        Country: '',
        PostalCode: '',
      });
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provider) {
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
          <DialogTitle>{provider ? 'Edit Provider' : 'Add New Provider'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ProviderName">Provider Name</Label>
            <Input
              id="ProviderName"
              name="ProviderName"
              value={formData.ProviderName}
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
          <div className="space-y-2">
            <Label htmlFor="Street">Street</Label>
            <Input
              id="Street"
              name="Street"
              value={formData.Street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="City">City</Label>
              <Input
                id="City"
                name="City"
                value={formData.City}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="State">State</Label>
              <Input
                id="State"
                name="State"
                value={formData.State}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="Country">Country</Label>
              <Input
                id="Country"
                name="Country"
                value={formData.Country}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="PostalCode">Postal Code</Label>
              <Input
                id="PostalCode"
                name="PostalCode"
                value={formData.PostalCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            { provider ? <Button type="submit">Update</Button> : 
            <Button type="submit">Add</Button>}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}