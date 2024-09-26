import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const handler = NextAuth({
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
        // console.log("Authorize Function Called");
        // console.log("Received Credentials:", credentials);

        if (
          !credentials?.captchaAnswer ||
          !credentials?.captchaNum1 ||
          !credentials?.captchaNum2
        ) {
          throw new Error("Captcha is required.");
        }

        const { captchaAnswer, captchaNum1, captchaNum2 } = credentials;

        console.log("Captcha Numbers Received:", captchaNum1, captchaNum2);
        console.log("Captcha Answer Provided:", captchaAnswer);

        const expectedAnswer = Number(captchaNum1) + Number(captchaNum2);

        console.log("Expected Captcha Answer:", expectedAnswer);

        if (Number(captchaAnswer) !== expectedAnswer) {
          throw new Error("Incorrect captcha answer.");
        }

        const data = {
          email: credentials.email,
          password: credentials.password,
        };
        const formData = new FormData();
        formData.append("json", JSON.stringify(data));
        formData.append("operation", "getUser");

        try {
          const response = await axios({
            url: `${process.env.NEXT_PUBLIC_URL}/php/users.php`,
            method: "POST",
            data: formData,
          });

          const { UserID, Name, UserType, Email } = response.data;
          const user: User = {
            id: UserID,
            name: Name,
            email: Email,
            usertype: UserType,
          };

          console.log("Authenticated User:", user);

          if (user) {
            return user;
          } else {
            throw new Error("Invalid credentials.");
          }
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Authentication failed.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id);
        token.name = user.name;
        token.email = user.email;
        token.usertype = user.usertype;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email!;
        session.user.usertype = token.usertype as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Customize the sign-in page if needed
  },
});

export { handler as GET, handler as POST };
