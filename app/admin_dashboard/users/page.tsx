"use client"
import AdminSideManageUsers from '@/components/admin-side-manage-users'
import React, { FC, useContext } from 'react'
import { UserProps } from '@/lib/types/user-types';
import { useSession } from 'next-auth/react';

const UsersListPage = () => {

  const session = useSession();

  return (
    <div className="flex flex-col flex-1 mx-auto p-4 max-h-[90vh] w-[90vw] max-w-7xl pl-[4vw] overflow-y-auto bg-background rounded-2xl border-black solid">
      <AdminSideManageUsers sessionData={session!.data}/>
    </div>
  )
}

export default UsersListPage