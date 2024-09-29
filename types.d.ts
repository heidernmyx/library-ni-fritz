// types.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number; // Ensure this is of the correct type
      name: string;
      usertype: string; // Ensure this is included
    };
  }

  interface User {
    id: number;
    name: string;
    usertype: string; // Ensure this is included
  }
}


declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name: string;
    usertype: string;
  }
}
