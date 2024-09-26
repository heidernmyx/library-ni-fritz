// import NextAuth from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      usertype: string
    };
  }

  interface User {
    id: number;
    name: string;
    email: string;
    usertype: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name: string;
  }
}