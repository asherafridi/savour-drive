import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./db";
import { isSamePass } from "./hash";
import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string; // Add role to the session
    } & DefaultSession["user"];
  }
}


export const authOption: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email", placeholder: "" },
        password: { label: "password", type: "password", placeholder: "" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const existingUser = await prisma.user.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!existingUser) {
          return null;
        }


        const comparePass = await isSamePass(
          credentials.password,
          existingUser.password
        );

        if (!comparePass) {
          return null;
        }

       

        return {
          id: `${existingUser.id}`,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.profileImg,
          role: existingUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role; // Add role to the token
      }
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = `${token.id}`;
      session.user.role = `${token.role}`; // Add role to the session
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOption);