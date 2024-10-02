import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { NextAuthOptions } from "next-auth";
import { User } from "next-auth";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60, // 1 hour
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
        captchaAnswer: { label: "Captcha Answer", type: "number" },
        captchaNum1: { label: "Captcha Num1", type: "number" },
        captchaNum2: { label: "Captcha Num2", type: "number" },
      },
      async authorize(credentials, req) {
        // console.log("Received Credentials:", credentials);

        if (
          !credentials?.captchaAnswer ||
          !credentials?.captchaNum1 ||
          !credentials?.captchaNum2
        ) {
          throw new Error("Captcha is required.");
        }

        const { captchaAnswer, captchaNum1, captchaNum2 } = credentials;

        // console.log("Captcha Numbers Received:", captchaNum1, captchaNum2);
        // console.log("Captcha Answer Provided:", captchaAnswer);

        const expectedAnswer = Number(captchaNum1) + Number(captchaNum2);

        // console.log("Expected Captcha Answer:", expectedAnswer);

        if (Number(captchaAnswer) !== expectedAnswer) {
          throw new Error("Incorrect captcha answer.");
        }

        const data = {
          email: credentials.email,
          password: credentials.password,
        };
        const formData = new FormData();
        formData.append("json", JSON.stringify(data));
        formData.append("operation", "login");

        const response = await axios({
          url: `${process.env.NEXT_PUBLIC_API_URL}/users.php`,
          method: "POST",
          data: formData,
        });

        const { user_id, name, role, email } = response.data.user;
        const user: User = {
          id: user_id,
          name: name,
          usertype: role,
          email: email,
        };
        if (user) {
          return user;
        } else {
          return null;
          // throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.name = user.name;
        token.usertype = user.usertype;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.usertype = token.usertype;
      }
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // Redirect based on usertype
      if (token?.usertype === "Admin") {
        return `${baseUrl}/admin_dashboard`;
      } else {
        return `${baseUrl}/dashboard`;
      }
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
