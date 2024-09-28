import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { use } from "react";

const handler = NextAuth({
  session: {
    strategy: 'jwt',
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 // 1 hour
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { },
        password: { }
      },
      async authorize(credentials, req) {

        const data = {
          email: credentials?.email,
          password: credentials?.password
        }
        const formData = new FormData();
        formData.append('json', JSON.stringify(data));
        formData.append('operation', 'getUser')
        
        const response = await axios({
          url: `${process.env.NEXT_PUBLIC_URL}/php/users.php`,
          method: 'POST',
          data: formData
        })
        
        const { UserID, Name, UserType, Email} = response.data;
        console.log(true)
        const user: User = { id: UserID, name: Name, email: Email, usertype: UserType }
        console.log(user)
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null

        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // console.log("token is: ",token)
      if (user) {
        token.id = Number(user.id);
        token.name = user.name;
        token.email = user.email;
        token.usertype = user.usertype;
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email!;
      session.user.usertype = String(token.usertype);
      return session;
    },
  }
})

export { handler as GET, handler as POST}