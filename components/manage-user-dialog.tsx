"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserFormProps, UserProps } from "@/lib/types/user-types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Session } from "next-auth";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ManageUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserFormProps) => void;
  onUpdate: (user: UserFormProps) => void;
  user: UserProps | null;
  session: Session | null;
}

const formFieldSchema = z.object({
  UserID: z.number(),
  Fname: z.string().trim().min(1, "First name is required").refine(value => value.trim() !== '', {
    message: "First name cannot be only spaces"
  }),
  Mname: z.string().optional(), // optional but trims spaces
  Lname: z.string().trim().min(1, "Last name is required").refine(value => value.trim() !== '', {
    message: "Last name cannot be only spaces"
  }),
  Email: z.string().email("Invalid email address").trim(),
  Phone: z.string().trim().min(1, "Phone number is required").refine(value => value.trim() !== '', {
    message: "Phone number cannot be only spaces"
  }),
  RoleID: z.number(),
  GenderID: z.number(),
});


type FormFieldValues = z.infer<typeof formFieldSchema>;

export default function ManageUserDialog({ isOpen, onClose, onSave, onUpdate, user, session }: ManageUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormFieldValues>({
    defaultValues: {
      UserID: 0,
      Fname: "",
      Mname: "",
      Lname: "",
      Email: "",
      Phone: "",
      RoleID: undefined,
      GenderID: undefined,
    },
    resolver: zodResolver(formFieldSchema),
  });

  // Update form values when the `user` prop changes
  useEffect(() => {
    if (user) {
      reset({
        UserID: user.UserID,
        Fname: user.Fname,
        Mname: user.Mname || "",
        Lname: user.Lname,
        Email: user.Email,
        Phone: user.Phone,
        RoleID: user.RoleName === "Admin" ? 1 : user.RoleName === "Librarian" ? 2 : 3,
        GenderID: user.GenderName === "Male" ? 1 : user.GenderName === "Female" ? 2 : 3,
      });
    } else {
      reset({
        UserID: 0,
        Fname: "",
        Mname: "",
        Lname: "",
        Email: "",
        Phone: "",
        RoleID: 0,
        GenderID: 0,
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<FormFieldValues> = async (data) => {
    try {
      if (!data.GenderID || !data.RoleID) {
        alert("Please select both Gender and Role before submitting.");
        return; // Prevent form submission
      }
      const formData = {
        ...data,
        Mname: data.Mname || "", // Ensure Mname is always a string
      };
      if (user) {
        onUpdate(formData); // Update user if editing
      } else {
        onSave(formData); // Save new user if adding
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="Fname">First Name</Label>
            <Input id="Fname" {...register("Fname", { required: true })} />
            {errors.Fname && <span className="text-red-500">First name is required</span>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="Mname">Middle Name</Label>
            <Input id="Mname" {...register("Mname")} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="Lname">Last Name</Label>
            <Input id="Lname" {...register("Lname", { required: true })} />
            {errors.Lname && <span className="text-red-500">Last name is required</span>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="Phone">Phone</Label>
            <Input id="Phone" {...register("Phone", { required: true })} />
            {errors.Phone && <span className="text-red-500">Phone number is required</span>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="Email">Email</Label>
            <Input id="Email" {...register("Email", { required: true })} type="email" />
            {errors.Email && <span className="text-red-500">A valid email is required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="Role">Role</Label>
              <Select 
                defaultValue={`${user?.RoleName == "Admin" ? 1 : user?.RoleName == "Librarian" ? 2 : 0}`}  
                onValueChange={(value) => setValue('RoleID', Number(value))} 
                {...register("RoleID", { required: true })}
                disabled={session?.user.usertype !== "Admin"}
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

            <div className="space-y-1">
              <Label htmlFor="Gender">Gender</Label>
              <Select defaultValue={`${user?.GenderName == "Male" ? 1 : user?.GenderName == "Female" ? 2 : 0}`} 
                onValueChange={(value) => setValue('GenderID', Number(value))} 
                {...register("GenderID", { required: true })}
              >
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
            <Button type="submit" disabled={isSubmitting}>
              {user ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
