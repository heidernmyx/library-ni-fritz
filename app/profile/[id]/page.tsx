// /app/profile/[id]/page.tsx

import { fetchUser } from '@/lib/actions/users';
import Profile from '@/components/profile';
import React from 'react';
import { UserProps } from '@/lib/types/user-types';
import axios from 'axios';


interface ProfilePageProps {
  params: {
    id: string; // or number if you want to convert it later
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { id } = params; // Access the dynamic route parameter
  const userID = parseInt(id, 10); // Convert to a number if needed

  const initialFetch = async () => {
    const response = await fetchUser(userID);
    console.log(true)
    console.log(response);
  }

  initialFetch();

  const fetchUser = async (id: number) => {
    alert(id)
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users.php`,{
      params: {
        operation: "fetch_user",
        json: JSON.stringify({ UserID: id })
      }
    })
    console.log(response.data);
    // alert(response.data)
    // return response.data;
  }
  return (
    <div>
      {/* Render your Profile component with the user data */}
      <Profile  />
      <h1>User ID: {id}</h1> {/* Just for display */}
      <h1></h1> {/* Just for display */}
    </div>
  );
}
