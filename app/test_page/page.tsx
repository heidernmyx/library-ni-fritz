"use client";
import { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';

const Dashboard = () => {
  const [sessionData, setSessionData] = useState<Session>(); 
  // const { data: session } = useSession();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/getSession');
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        setSessionData(data.session); // Set fetched session data
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);
  // Use either the fetched sessionData or the session from useSession
  // const userType = sessionData?.user? || session?.user;

  return (
    <div>
      {sessionData ? (
        <>
        <p>User ID: {sessionData.user.id}</p>
        <p>User Name: {sessionData.user.name}</p>
        <p>User Type: {sessionData.user.usertype}</p></>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default Dashboard;